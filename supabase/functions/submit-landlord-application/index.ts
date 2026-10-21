
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";


const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");
const bucketName= Deno.env.get("landlord-ownership-documents");

const firebaseJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);


const MAX_FILE_SIZE=10*1024*1024*1024;

const allowedTypes:Record<string,string>={
"applicationPDF":"pdf",
"img/jpeg":"jpeg",
"img/png":"png",

};

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, _ctx) => {

      
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: { Allow: "POST" } },
        );
      }

      if (!firebaseProjectId) {
        console.error("FIREBASE_PROJECT_ID is not configured.");

        return Response.json(
          { error: "Server configuration error" },
          { status: 500 },
        );
      }

      
      const authorization = req.headers.get("Authorization");

      
      const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

      
      if (!token) {
        return Response.json(
          { error: "Missing Firebase ID token" },
          { status: 401 },
        );
      }

      try {
        
        const { payload } = await jose.jwtVerify(
          token,
          firebaseJwks,
          {
            
            issuer: `https://securetoken.google.com/${firebaseProjectId}`,

            
            audience: firebaseProjectId,

            
            algorithms: ["RS256"],
          },
        );

        
        if (
          typeof payload.sub !== "string" ||
          payload.sub.length === 0
        ) {
          return Response.json(
            { error: "Invalid Firebase user identity" },
            { status: 401 },
          );
        }

        
        return Response.json({
          message: "Firebase token verified successfully",
          uid: payload.sub,
        });

      } catch {
        
        return Response.json(
          { error: "Invalid or expired Firebase ID token" },
          { status: 401 },
        );
      }
    },
  ),
};

const formData=await req.formData();
const uploadeFile=formData.get("file");

if(!(uploadedFile instanceOf file)){
  return Response.json(
    {error:"A document file is required"},
    {status:400},
  );
};

const filePath = `${uid}/${crypto.randomUUID()}.${extension}`;

const {data,error}=await ctx.supabaseAdmin.storage
.from(landlord-ownership-documents)
.upload(filePath,file{
  .contentType:file.type,
  upsert:false
});

