
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

// STEP 1: Read the Firebase project ID from the server environment.
const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");

// STEP 2: Prepare the trusted public keys used to verify Firebase tokens.
const firebaseJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

// STEP 3: Define the HTTP endpoint.
export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, _ctx) => {

      // STEP 4: Accept POST requests only.
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: { Allow: "POST" } },
        );
      }

      // STEP 5: Check that our Firebase project ID is configured.
      if (!firebaseProjectId) {
        console.error("FIREBASE_PROJECT_ID is not configured.");

        return Response.json(
          { error: "Server configuration error" },
          { status: 500 },
        );
      }

      // STEP 6: Read the Authorization header.
      const authorization = req.headers.get("Authorization");

      // Extract the token after the word "Bearer".
      const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

      // STEP 7: Reject requests without a token.
      if (!token) {
        return Response.json(
          { error: "Missing Firebase ID token" },
          { status: 401 },
        );
      }

      try {
        // STEP 8: Verify the Firebase token.
        const { payload } = await jose.jwtVerify(
          token,
          firebaseJwks,
          {
            // The token must come from our Firebase project.
            issuer: `https://securetoken.google.com/${firebaseProjectId}`,

            // The token must be intended for our Firebase project.
            audience: firebaseProjectId,

            // Accept Firebase's expected signing algorithm.
            algorithms: ["RS256"],
          },
        );

        // STEP 9: Ensure the verified token identifies a user.
        if (
          typeof payload.sub !== "string" ||
          payload.sub.length === 0
        ) {
          return Response.json(
            { error: "Invalid Firebase user identity" },
            { status: 401 },
          );
        }

        // STEP 10: Return the verified user's Firebase UID.
        return Response.json({
          message: "Firebase token verified successfully",
          uid: payload.sub,
        });

      } catch {
        // Verification failed, or an unexpected error occurred.
        return Response.json(
          { error: "Invalid or expired Firebase ID token" },
          { status: 401 },
        );
      }
    },
  ),
};
