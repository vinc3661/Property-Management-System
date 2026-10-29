
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

const publicJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);


async function getGoogleAccessToken(
  serviceAccountJson: string
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
  documentPath: string
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
      response.status
    );
    throw new Error("Could not retrieve Firestore document");
  }

  return await response.json();
};
 export async function getFirestoreCollection(
  accessToken:string,
  collection:string,
  landlordId:string,
 ){



 };

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, ctx) => {
      
      if (!projectId) {
        return Response.json(
          { error: "Firebase project ID not configured" },
          { status: 500 }
        );
      }

      const serviceAccountJson = Deno.env.get(
        "FIREBASE_SERVICE_ACCOUNT_JSON"
      );

      if (!serviceAccountJson) {
        return Response.json(
          { error: "Firebase service account not configured" },
          { status: 500 }
        );
      }

      
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: { Allow: "POST" } }
        );
      }

      // 3. Get the Firebase ID token supplied by the frontend.
      const token = req.headers.get("x-firebase-id-token");

      if (!token) {
        return Response.json(
          { error: "Firebase ID token was not provided" },
          { status: 401 }
        );
      }

      
      let uid: string;

      try {
        const { payload } = await jose.jwtVerify(token, publicJwks, {
          issuer: `https://securetoken.google.com/${projectId}`,
          audience: projectId,
          algorithms: ["RS256"],
        });

        if (typeof payload.sub !== "string" || !payload.sub) {
          return Response.json(
            { error: "Invalid Firebase user identity" },
            { status: 401 }
          );
        }

        uid = payload.sub;
      } catch (error) {
        console.error("Firebase token verification failed:", error);

        return Response.json(
          { error: "Invalid or expired Firebase ID token" },
          { status: 401 }
        );
      }

      
      try {
        const googleAccessToken = await getGoogleAccessToken(
          serviceAccountJson
        );

        const profile = await getFirestoreDocument(
          googleAccessToken,
          `profiles/${uid}`
        );

        if (!profile) {
          return Response.json(
            { error: "User profile not found" },
            { status: 403 }
          );
        }

        const fields = profile.fields as
          | Record<string, { stringValue?: string }>
          | undefined;

        const role = fields?.role?.stringValue;

        if (role !== "landlord") {
          return Response.json(
            {
              error:
                "AI access is currently available to landlords only",
            },
            { status: 403 }
          );
        }

        
        return Response.json({
          message: "Firebase authentication and profile lookup successful",
          uid,
          role,
        });
      } catch (error) {
        console.error("Property AI request failed:", error);

        return Response.json(
          { error: "Could not verify property AI access" },
          { status: 500 }
        );
      }
    }
  ),
};
