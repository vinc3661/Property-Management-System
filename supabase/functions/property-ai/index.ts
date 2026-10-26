
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");


const publicJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, ctx) => {
if (!projectId){
 return Response.json(
    {error:"projectID not configured"},
    {status:500}
  );
}


const serviceAccountJson=Deno.env.get(
  "FIREBASE_SERVICE_ACCOUNT_JSON"
);
if (!serviceAccountJson){
  return Response.json(
    {error:"FIREBASE_SERVICE_ACCOUNT_JSON not configured"},
    {status:500}
  );
};

      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: { Allow: "POST" } }
        );
      }

      const token = req.headers.get("x-firebase-id-token");

      if (!token) {
        return Response.json(
          { error: "Firebase ID token was not provided" },
          { status: 401 }
        );
      }

      try {
        const { payload } = await jose.jwtVerify(
          token,
          publicJwks,
          {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
            algorithms: ["RS256"],
          }
        );

        const uid = payload.sub;

        if (typeof uid !== "string" || !uid) {
          return Response.json(
            { error: "Invalid Firebase user identity" },
            { status: 401 }
          );
        }

        
        return Response.json({
          message: "Firebase token verified successfully",
          uid,
        });
      } catch (error) {
        console.error("Firebase token verification failed:", error);

        return Response.json(
          { error: "Invalid or expired Firebase ID token" },
          { status: 401 }
        );
      }
    }
  ),
};

  



