
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import {verifyFirebaseToken,getGoogleAccessToken} from "./functions/_shared/firebase.ts";

const projectId=Deno.env.get(FIREBASE_PROJECT_ID);
const adminUid=Deno.env.get(ADMIN_UID);

const bucketName=Deno.env.get(OWNERSHIP_DOCUMEN_BUCKET)as 
"landlord ownership document"
  

  
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


console.log("Hello from Functions!");
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
  
    if(req.method==="OPTIONS"){
      return new Response(ok,{
        headers:corseHeaders;
      }
      );
    }
if(req.method!=="POST"){
  return response.json(
    {error:"method not allowed"},
    {status:401,headers:corseHeaders},
  );
  
  if(!projectId){
    return response.json(
      {error:"projectId not configured"},
      {status:500,headers:corseHeaders},
    );

    try{

const token=await verifyFirebaseToken();

const adminUid=payload.sub;

if(!payload.sub||payload.sub!=="string"){
  return Response.json(
    {error:"invalid user uid"},
    {status:405,headers:corseHeaders}
  );
};
const googleToken=await getGoogleAccessToken();

if(!firebaseToken||firebaseToken!=="string"){
  return Response.json(
    {error:"invalid google token"},
    {status:405,headers:corseHeaders},
  );
};


        const firestoreUrl =
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/applicants?pageSize=100`;


const firestoreResponse=await fetch(firestoreUrl),{
  method:"Get",
  headers:{
Authorization:`Bearer ${googleToken}`,
  },
  };

  if(!firestoreResponse.ok){
    return Response.json(
      {error:"failed to get firestoreData"},
      {status:"400",headers:corseHeaders},
    );
  }),
};
