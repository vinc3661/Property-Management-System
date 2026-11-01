
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";


const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};



const projectId=Deno.env.get("FIREBASE_PROJECT_ID");

const appURL=
Deno.env.get("APP_URL")?? "https://localhost:5173";

const publicJWKS=jose.createRemoteJWKSet(
  new URL (
     "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
  );





export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {

if(req.method ==="OPTIONS"){
  return new Response("ok",{
    headers: corsHeaders,
  });
}



    if(req.method !=="POST"){
      return Response(
        {error:"method not allowed"}
        {status:405, headers:corseHeaders},
        
      )
    }
    
    
    
    if(!projectId){
      return Response.json({
        error:"FIREBASE_PROJECT_ID IS NOT CONFIGURED"
  },
{status:500,headers:corseHeaders}

)};
    

const formData=await req.formData();
const token=formData.get("firebaseIdToken");

if(typeOf token !=="string" || "!token"){
return Response(
  {error:"Firebase Id token was not provided"},
  {status:401,headers:corseHeaders},
)

}

const {payLoad}=await jose.jwtVerify(token,publicJWKS,{
  issuer:`https://securetoken.google.com/${projectId}`,
  audience:{projectId},
  alg:{RS256},
});

if(!payLoad.sub||payload.sub!=="string"){
return Response (
  {error:"failed to get signed in user"},
  {status:401,headers:corseHeaders},
)
}

  }),
};


