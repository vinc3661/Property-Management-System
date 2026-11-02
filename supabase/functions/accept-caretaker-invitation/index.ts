
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import {verifyFirebaseToken,getFirestoreProfile} from "../_shared/firebase.ts";

const corsHeaders={
"Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

};



export default {
  fetch: withSupabase({ auth: ["publishable", ] }, async (req, ctx) => {
  
if(req.method==="OPTIONS"){
  return new Response("ok",
    headers:corsHeaders,
  )
};    

if(req.method!=="POST"){
  return Response.json(
    {error:"method not allowed"},
    {status:500, headers:corsHeaders}
  )
};

try{
  const body=await req.json();

  const email=typeOf body.email==="string" ?body.email.trim().toLowerCase():"";
  const firebaseIdToken=typeOf body.firebaseIdToken==="string"?body.firebaseIdToken.toLowercase():"";

  
if(!projectId){
  return Response.json(
    {error:"project id not configured"},
    {status:500, headers:corsHeaders}
  )
};


  if(email typeOf!=="string" ||!email.trim()){
    return Response.json(
      {error:"invalid email"},
      {status:400, headers:corsHeaders}
    )
  };

if(!firebaseIdToken || typeOf firebaseIdToken!=="string" || !firebaseIdToken.trim()){
  return Response.json(
    {error:"invalid firebase id token"},
    {status:400, headers:corsHeaders}
  )
};

const payload=await verifyFirebaseToken(firebaseIdToken);
const landlordId=payload.sub;

if(!landlordId){
  return Response.json(
    {error:"invalid firebase id token"},
    {status:400, headers:corsHeaders}
  )
};

const profile=await getFirestoreProfile(landlordId);

const role=profile.fields?.role?.stringValue;
if(role!=="caretaker"){
  return Response.json(
    {error:"user is not a caretaker"},
    {status:400, headers:corsHeaders}
  )
};



}


  }),
};
