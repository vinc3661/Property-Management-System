
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

const projectId= Deno.env.get("FIREBASE_PROJECT_ID");

const publicJwks=await jose.createRemoteJWKSet(
  new URL ("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
);



export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
   
if (!projectID){
  respond.json(
    {error:"missing FIREBASE_PROJECT_ID"},
    {status:500},
  )
}


if (req.method !=="POST"){
  respond.json(
    {error:"the request method is wrong"},
    {status:401},
  );
};




    const { name } = await req.json();

    return Response.json({
      message: `Hello ${name}!`,
    });
  }),
};

