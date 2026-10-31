
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";


const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

const bucketName =
  Deno.env.get("OWNERSHIP_DOCUMENTS_BUCKET") ??
  "landlord-ownership-documents";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const publicJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, ctx) => {

      
      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: corsHeaders,
        });
      }

      
      if (!projectId) {
        return Response.json(
          { error: "FIREBASE_PROJECT_ID is not configured" },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          {
            status: 405,
            headers: {
              ...corsHeaders,
              Allow: "POST",
            },
          }
        );
      }

      
      const formData=await req.formData();
      const token=formData.get("firebaseIdToken");


if (typeof token !== "string" || !token) {
  return Response.json(
    { error: "Firebase ID token was not provided" },
    {
      status: 401,
      headers: corsHeaders,
    }
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
            {
              status: 401,
              headers: corsHeaders,
            }
          );
        }

        
        
        const file = formData.get("file");

        if (!(file instanceof File)) {
          return Response.json(
            { error: "Please provide a file using the 'file' field" },
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        
        const extension = allowedTypes[file.type];

        if (!extension) {
          return Response.json(
            {
              error:
                "Unsupported file type. Upload a PDF, JPEG, or PNG file.",
            },
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        
        if (file.size === 0 || file.size > MAX_FILE_SIZE) {
          return Response.json(
            {
              error:
                "File must be larger than 0 bytes and no bigger than 10 MiB.",
            },
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        
        const documentPath =
          `${uid}/${crypto.randomUUID()}.${extension}`;

        const fileBytes = await file.arrayBuffer();

        
        const { data, error } = await ctx.supabaseAdmin.storage
          .from(bucketName)
          .upload(documentPath, fileBytes, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          console.error(
            "Ownership document upload failed:",
            error.message
          );

          return Response.json(
            { error: "Failed to upload ownership document" },
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }

        
        return Response.json(
          {
            message: "Ownership document uploaded successfully",
            uid,
            documentPath: data.path,
          },
          {
            status: 201,
            headers: corsHeaders,
          }
        );

      } catch (error) {
        console.error(
          "Ownership application request failed:",
          error instanceof Error ? error.message : "Unknown error"
        );

        if (
          error instanceof jose.errors.JWTExpired ||
          error instanceof jose.errors.JWTClaimValidationFailed ||
          error instanceof jose.errors.JWSSignatureVerificationFailed
        ) {
          return Response.json(
            { error: "Invalid or expired Firebase ID token" },
            {
              status: 401,
              headers: corsHeaders,
            }
          );
        }

        return Response.json(
          { error: "Unable to process ownership document request" },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }
  ),
};
