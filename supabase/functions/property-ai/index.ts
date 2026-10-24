
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
    {error:"method not allowed"},
    {status:405,headers:Allow:"POST"},
  );
};


     
const token=await req.headers.get("x-firebase-id-token": token,)
if (!token){
response.json(
  {error:"signed token was not found"},
  {status:401},
);

};

let uid=useruid;
    const { payload } = await jose.jwtVerify(
      token,
      publicjwks,
    }
    issuer: `https://securetoken.google.com/${projectId}`
    audience:"projectId"
    alogarithm:[RS256]
  );
const uid=payload.sub;

  if (typeOf payload.sub !=="string"||!payload.sub){
    response.json(
      {error:"invalid firebase user identity"},
      {error:401},
    )
    return Response.json({
    message:"firebase token verified successfully"},
    );

  

  }),

}catch(error){
  console.error("firebase token verification:"error);


response Response.json({
  errror:"invalid or expired firebase token"
},
{status:401}
);

};

  



