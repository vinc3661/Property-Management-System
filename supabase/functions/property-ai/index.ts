
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

const publicJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);


async function getGoogleAccessToken(
  serviceAccountJson: string,
): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);

  const clientEmail = serviceAccount.client_email;
  const privateKey = serviceAccount.private_key;
  const tokenUri = serviceAccount.token_uri;

  if (!clientEmail || !privateKey || !tokenUri) {
    throw new Error("Invalid Firebase service account configuration");
  }

  const key = await jose.importPKCS8(privateKey, "RS256");
  const now = Math.floor(Date.now() / 1000);

  const assertion = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience(tokenUri)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    console.error("Google access token request failed:", response.status);
    throw new Error("Could not obtain Google access token");
  }

  const result = await response.json();

  if (typeof result.access_token !== "string") {
    throw new Error("Google access token was missing from the response");
  }

  return result.access_token;
}

async function getFirestoreDocument(
  accessToken: string,
  documentPath: string,
): Promise<Record<string, unknown> | null> {
  if (!projectId) {
    throw new Error("Firebase project ID is missing");
  }

  const encodedPath = documentPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/documents/${encodedPath}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error(
      "Firestore document request failed:",
      response.status,
    );
    throw new Error("Could not retrieve Firestore document");
  }

  return await response.json();
}

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  arrayValue?: {
    values?: FirestoreValue[];
  };
  mapValue?: {
    fields?: Record<string, FirestoreValue>;
  };
};
function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) {
    return value.stringValue;
  }

  if ("integerValue" in value) {
    const number = Number(value.integerValue);

    if (!Number.isSafeInteger(number)) {
      throw new Error("Invalid or unsafe Firestore integer");
    }

    return number;
  }

  if ("doubleValue" in value) {
    return value.doubleValue;
  }

  if ("booleanValue" in value) {
    return value.booleanValue;
  }

  if ("timestampValue" in value) {
    return value.timestampValue;
  }

  if ("nullValue" in value) {
    return null;
  }

  if ("arrayValue" in value) {
    return (value.arrayValue?.values ?? []).map(
      decodeFirestoreValue,
    );
  }

  if ("mapValue" in value) {
    return decodeFirestoreFields(
      value.mapValue?.fields ?? {},
    );
  }

  throw new Error("Unsupported Firestore value type");
}


function decodeFirestoreFields(
  fields: Record<string, FirestoreValue>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      decodeFirestoreValue(value),
    ]),
  );
}
async function getFirestoreCollection(
  accessToken: string,
  collection: string,
  landlordId: string,
): Promise<Record<string, unknown>[]> {
  if (!projectId) {
    throw new Error("Firebase project ID not configured");
  }

  if (!accessToken || !landlordId) {
    throw new Error("Access token and landlord ID are required");
  }

  const allowedCollections = ["tenants", "properties"];

  if (!allowedCollections.includes(collection)) {
    throw new Error("Unsupported Firestore collection");
  }

  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/documents:runQuery`;

  const query = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: "landlordId" },
          op: "EQUAL",
          value: { stringValue: landlordId },
        },
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    console.error(
      "Firestore collection request failed:",
      response.status,
    );
    throw new Error("Could not retrieve Firestore collection");
  }

  const results: unknown = await response.json();

  if (!Array.isArray(results)) {
    throw new Error("Unexpected Firestore query response");
  }

  return results
    .filter((item) => {
      return (
        item !== null &&
        typeof item === "object" &&
        "document" in item &&
        item.document !== null &&
        typeof item.document === "object" &&
        "name" in item.document &&
        typeof item.document.name === "string" &&
        "fields" in item.document &&
        item.document.fields !== null &&
        typeof item.document.fields === "object"
      );
    })
    .map((item) => {
      const document = item.document;

      const fields = decodeFirestoreFields(
        document.fields as Record<string, FirestoreValue>,
      );

      return {
        ...fields,
        id: document.name.split("/").pop(),
      };
    });
}

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, _ctx) => {
      if (!projectId) {
        return Response.json(
          { error: "Firebase project ID not configured" },
          { status: 500 },
        );
      }

      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: { Allow: "POST" } },
        );
      }

      const serviceAccountJson = Deno.env.get(
        "FIREBASE_SERVICE_ACCOUNT_JSON",
      );

      if (!serviceAccountJson) {
        return Response.json(
          { error: "Firebase service account not configured" },
          { status: 500 },
        );
      }

      const token = req.headers.get("x-firebase-id-token");

      if (!token) {
        return Response.json(
          { error: "Firebase ID token was not provided" },
          { status: 401 },
        );
      }

      let uid: string;

      try {
        const { payload } = await jose.jwtVerify(
          token,
          publicJwks,
          {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
            algorithms: ["RS256"],
          },
        );

        if (typeof payload.sub !== "string" || !payload.sub) {
          return Response.json(
            { error: "Invalid Firebase user identity" },
            { status: 401 },
          );
        }

        uid = payload.sub;
      } catch (error) {
        console.error("Firebase token verification failed:", error);

        return Response.json(
          { error: "Invalid or expired Firebase ID token" },
          { status: 401 },
        );
      }

        const googleAccessToken = await getGoogleAccessToken(
          serviceAccountJson,
        );
             let verifiedLandlordId: string;

if (profile.role === "landlord") {
  verifiedLandlordId = uid;
} else if (profile.role === "caretaker") {
  if (!profile.landlordId) {
    return new Response(
      JSON.stringify({ error: "Caretaker is not assigned to a landlord" }),
      { status: 403 }
    );
  }

  verifiedLandlordId = profile.landlordId;
} else {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    { status: 403 }
  );
}

        const [tenants, properties] = await Promise.all([
          getFirestoreCollection(
            googleAccessToken,
            "tenants",
            verifiedLandlordId,
          ),
          getFirestoreCollection(
            googleAccessToken,
            "properties",
            verifiedLandlordId,
          ),
        ]);

        return Response.json({
          message: "Landlord access verified and data retrieved",
          data: {
            tenants,
            properties,
          },
        });
      } catch (error) {
        console.error("Property AI request failed:", error);

        return Response.json(
          { error: "Could not retrieve authorized property data" },
          { status: 500 },
        );
      }
    },
  ),
};
