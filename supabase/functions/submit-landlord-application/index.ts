
import "@supabase/functions-js/edge-runtime.d.ts";

import { pipeline } from "@supabase/middleware";
import { withCors } from "@supabase/middleware/cors";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

import { createRateLimiter } from "../_shared/rateLimit.ts";


const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

const bucketName =
  Deno.env.get("OWNERSHIP_DOCUMENTS_BUCKET") ??
  "landlord-ownership-documents";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const rateLimiter = createRateLimiter({
  limit: 3,
  window: "1 h",
  prefix: "pms:landlord-application",
});



const firebaseJwks = projectId
  ? jose.createRemoteJWKSet(
      new URL(
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
      )
    )
  : null;

async function verifyFirebaseToken(
  authorizationHeader: string | null
) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization token");
  }

  if (!projectId || !firebaseJwks) {
    throw new Error("Firebase authentication is not configured");
  }

  const token = authorizationHeader.slice(7);

  const { payload } = await jose.jwtVerify(
    token,
    firebaseJwks,
    {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    }
  );

  if (!payload.sub || typeof payload.sub !== "string") {
  throw new Error("Firebase token is missing a valid user ID");
}

if (payload.email_verified !== true) {
  throw new Error("Firebase email address is not verified");
}

  return {
    uid: payload.sub,
    email: payload.email,
  };
}


function getFileExtension(contentType: string): string {
  switch (contentType) {
    case "application/pdf":
      return "pdf";

    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    default:
      throw new Error("Unsupported file type");
  }
}

function validateFileSignature(
  bytes: Uint8Array,
  contentType: string
): boolean {
  if (contentType === "application/pdf") {
    return (
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d
    );
  }

  if (contentType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (contentType === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  return false;
}

export default {
  fetch: pipeline(
    [
      
      withCors({
        origin: [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://192.168.100.102:5173",
        ],
        methods: ["POST", "OPTIONS"],
        maxAge: 86400,
      }),

      withSupabase({
        auth: ["publishable"],
        cors: "disabled",
      }),
    ],

    async (req, ctx) => {
     
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }

      try {
      
        const user = await verifyFirebaseToken(
          req.headers.get("Authorization")
        );

        
        const rateLimitResult = await rateLimiter.limit(
          user.uid
        );

        if (!rateLimitResult.success) {
          return Response.json(
            {
              error:
                "Too many applications. Please try again later.",
            },
            { status: 429 }
          );
        }

       
        const formData = await req.formData();

        const propertyAddress =
          formData.get("propertyAddress");

        const ownershipDocument =
          formData.get("ownershipDocument");

        if (
          typeof propertyAddress !== "string" ||
          propertyAddress.trim().length === 0
        ) {
          return Response.json(
            { error: "Property address is required" },
            { status: 400 }
          );
        }

        if (!(ownershipDocument instanceof File)) {
          return Response.json(
            { error: "Ownership document is required" },
            { status: 400 }
          );
        }

      
        if (ownershipDocument.size === 0) {
          return Response.json(
            { error: "The uploaded document is empty" },
            { status: 400 }
          );
        }

        if (ownershipDocument.size > MAX_FILE_SIZE) {
          return Response.json(
            { error: "File size must not exceed 5 MB" },
            { status: 400 }
          );
        }

       

        if (!ALLOWED_MIME_TYPES.has(ownershipDocument.type)) {
          return Response.json(
            {
              error: "Only PDF, JPEG and PNG files are allowed",
            },
            { status: 400 }
          );
        }


        const fileBytes = new Uint8Array(
          await ownershipDocument.arrayBuffer()
        );

        if (
          !validateFileSignature(
            fileBytes,
            ownershipDocument.type
          )
        ) {
          return Response.json(
            {
              error: "File content does not match its file type",
            },
            { status: 400 }
          );
        }

     

        const extension = getFileExtension(
          ownershipDocument.type
        );

        const documentPath =
          `${user.uid}/${crypto.randomUUID()}.${extension}`;

       

        const { error: uploadError } =
          await ctx.supabaseAdmin.storage
            .from(bucketName)
            .upload(documentPath, fileBytes, {
              contentType: ownershipDocument.type,
              upsert: false,
            });

        if (uploadError) {
          console.error(
            "Ownership document upload failed:",
            uploadError
          );

          return Response.json(
            {
              error: "Failed to upload ownership document",
            },
            { status: 500 }
          );
        }

        
        return Response.json(
          {
            message:
              "Landlord application submitted successfully",
            uid: user.uid,
            email: user.email,
            documentPath,
          },
          { status: 201 }
        );

      } catch (error) {
        console.error(
          "Landlord application error:",
          error
        );

        if (
          error instanceof jose.errors.JWTExpired ||
          error instanceof jose.errors.JWTInvalid
        ) {
          return Response.json(
            {
              error:
                "Your authentication session is invalid or expired",
            },
            { status: 401 }
          );
        }

        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("authorization")
        ) {
          return Response.json(
            { error: error.message },
            { status: 401 }
          );
        }

        return Response.json(
          {
            error: "Unable to submit landlord application",
          },
          { status: 500 }
        );
      }
    }
  ),
};
