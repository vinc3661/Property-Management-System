
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";
import {verifyFirebaseToken,getFirestoreProfile} from "../_shared/firebase.ts";
const app=(Deno.env.get("APP_URL")??"http://localhost:5173").
replace(/\/$/,"");

const INVITATION_EXPIRATION_HOURS=48;

function generateToken():string{
  const bytes=crypto.GetRandomvalues(new unit8Array(32))
return Array.from(bytes)
.map((byte)=>byte.toString(16).padStart(2,"0"))
.join("");



}


const corsHeaders = {
  "Access-Control-Allow-Origin": app,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

const publicJWKS = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, _ctx) => {

      
      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: corsHeaders,
        });
      }

      
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: corsHeaders }
        );
      }


      if (!projectId) {
        return Response.json(
          { error: "FIREBASE_PROJECT_ID is not configured" },
          { status: 500, headers: corsHeaders }
        );
      }

      
      const formData = await req.formData();
      const token = formData.get("firebaseIdToken");

      if (typeof token !== "string" || !token) {
        return Response.json(
          { error: "Firebase ID token was not provided" },
          { status: 401, headers: corsHeaders }
        );
      }

      
      try {
        const { payload } = await jose.jwtVerify(
          token,
          publicJWKS,
          {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
            algorithms: ["RS256"],
          }
        );
 const user=payload.sub
        
        if (typeof payload.sub !== "string" || !payload.sub) {
          return Response.json(
            { error: "Failed to identify signed-in user" },
            { status: 401, headers: corsHeaders }
          );
        }

        
        return Response.json(
          { message: "Firebase token verified successfully" },
          { headers: corsHeaders }
        );

      } catch (error) {
        console.error("Firebase token verification failed:", error);

        return Response.json(
          { error: "Invalid or expired Firebase ID token" },
          { status: 401, headers: corsHeaders }
        );
      }
    }
  ),
};
