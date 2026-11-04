
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

const bucketName =
  Deno.env.get("OWNERSHIP_DOCUMENTS_BUCKET") ??
  "landlord-ownership-documents";

const appUrl = Deno.env.get("APP_URL");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};


const allowedOrigins = new Set([
  "http://localhost:5173",
]);

if (appUrl) {
  try {
    allowedOrigins.add(new URL(appUrl).origin);
  } catch {
    console.error("Invalid APP_URL configuration");
  }
}

function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}


function hasValidSignature(
  bytes: Uint8Array,
  mimeType: string
): boolean {
  if (mimeType === "application/pdf") {
    return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  }

  if (mimeType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    const signature = [
      0x89, 0x50, 0x4e, 0x47,
      0x0d, 0x0a, 0x1a, 0x0a,
    ];

    return signature.every(
      (value, index) => bytes[index] === value
    );
  }

  return false;
}

const publicJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, ctx) => {
      const corsHeaders = getCorsHeaders(req);

      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: corsHeaders,
        });
      }

      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          {
            status: 405,
            headers: {
              ...corsHeaders,
              Allow: "POST, OPTIONS",
            },
          }
        );
      }

      if (!projectId) {
        console.error("FIREBASE_PROJECT_ID is not configured");

        return Response.json(
          { error: "Server configuration error" },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      try {
        const formData = await req.formData();

        const token = formData.get("firebaseIdToken");

        if (typeof token !== "string" || !token) {
          return Response.json(
            { error: "Firebase ID token was not provided" },
            {
              status: 401,
              headers: corsHeaders,
            }
          );
        }

        
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

        
        if (payload.email_verified !== true) {
          return Response.json(
            { error: "Please verify your email before submitting documents" },
            {
              status: 403,
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
              error: "Unsupported file type. Upload a PDF, JPEG, or PNG file.",
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
              error: "File must be larger than 0 bytes and no bigger than 5 MiB.",
            },
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

      
        const fileBytes = new Uint8Array(
          await file.arrayBuffer()
        );

        if (!hasValidSignature(fileBytes, file.type)) {
          return Response.json(
            {
              error: "The file contents do not match the declared file type.",
            },
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        
        const documentPath =
          `${uid}/${crypto.randomUUID()}.${extension}`;

        
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

        console.error(
          "Ownership application request failed:",
          error instanceof Error ? error.message : "Unknown error"
        );

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
