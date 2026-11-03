
import * as jose from "jsr:@panva/jose@6";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
const serviceceAccountJson=Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
if (!projectId || !serviceAccountJson) {
  throw new Error("Firebase service account configuration is missing");
}

const serviceAccount = JSON.parse(serviceAccountJson);

const privateKey = await jose.importPKCS8(
  serviceAccount.private_key,
  "RS256"
);

const firebaseJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export async function verifyFirebaseToken(token: string) {
  const { payload } = await jose.jwtVerify(token, firebaseJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });

  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Invalid Firebase user ID");
  }

  return payload;
}

export async function getFirestoreAccessToken() {
  const now = Math.floor(Date.now() / 1000);

  const assertion = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Could not obtain Firestore access token");
  }

  const data = await response.json();
  return data.access_token as string;
}

export async function getFirestoreProfile(uid: string) {
  const accessToken = await getFirestoreAccessToken();

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/profiles/${uid}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not retrieve user profile");
  }

  return response.json();
}


export async function updateFirestoreProfile(
  uid: string,
  updates: {
    role: "caretaker";
    landlordId: string;
  }
) {
  const accessToken = await getFirestoreAccessToken();

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/profiles/${uid}`
  );

  
  url.searchParams.append("updateMask.fieldPaths", "role");
  url.searchParams.append("updateMask.fieldPaths", "landlordId");

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        role: {
          stringValue: updates.role,
        },
        landlordId: {
          stringValue: updates.landlordId,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();

    console.error("Firestore profile update error:", errorDetails);

    throw new Error("Could not update caretaker profile");
  }

  return response.json();
}
