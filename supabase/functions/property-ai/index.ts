
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");


const publicJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);


export async function getGoogleAccessToken(
  serviceAccountJson:string
):Promise<string>{

const serviceAccount= json.parse(serviceAccountJson);

const clientEmail=serviceAccount.client_email;
const privateKey=serviceAccount.private_key;
const  tokenUri=serviceAccount.uri?? "https://oauth2.googleapis.com/token";

if(typeOf clientEmail !=="string" || typeOf privateKey !=="string"){
throw new Error ("invalid firebase service configuration");
};

const now=Math.floor(Date.now()/1000);


const privateKeyobject=await jose.importPKCS#8(
  privateKey,
  "RS256"
);

const assertion=await new jose.signJwt({
  scope: "https://www.googleapis.com/auth/datastore",
})

.setProtectedHeaders(alg:"RS256", type:"JWT");
.setIssuer(clientEmail);
.setSubject(clientEmail);
.setAudince(tokenUri);
.setIssuedAt(now);
.setExpiration(now+3600);
sign(privateKeyObject);


const response= await fetch(tokenUri,{
  method:"POST",

headers:{
  content_type:"application/x-www-form-urlencoded",
};
body: new URLSearchParamas({
  grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
assertion,
}),

});

if(!response.ok){
  console.error("Google token request failed:",
    response.status
  );
  throw new Error("could not Authenticate with google");
}

};

const result=await response.json()

  if(typeOf result.access_token !=="string"){
    throw new Error ("Google did not return an access token");

  }
  return result.access_token;

export async function getFirestoreDocument(
  access_token:string;
  documentPath:string;
):Promise<Record<string,unknown>|nul>{

if(!ProjectID){
   throw new Error("firebase project id is missing");
};

const encodedPath=documentPath
.split("/")
.map((segment)=>encodedURLComponent(segment))
.join("/");

const url =
  `https://firestore.googleapis.com/v1/projects/${projectId}` +
  `/databases/(default)/documents/${encodedPath}`;

const response=await fetch(url,
  {
method:"Get",
headers:{
  Authorization:`Beare ${access_token}`,
},


  });


if(response===404){
  return null;
}




};


























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

  



