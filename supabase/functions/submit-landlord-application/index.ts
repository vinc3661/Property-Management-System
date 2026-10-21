
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as jose from "jsr:@panva/jose@6";

const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");
const bucketName = Deno.env.get("OWNERSHIP_DOCUMENTS_BUCKET");

const firebaseJwks = jose.createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: { Allow: "POST" } },
        );
      }

      if (!firebaseProjectId || !bucketName) {
        return Response.json(
          { error: "Server configuration error" },
          { status: 500 },
        );
      }

      
      const token = req.headers.get("x-firebase-id-token");

      if (!token) {
        return Response.json(
          { error: "Missing Firebase ID token" },
          { status: 401 },
        );
      }

      let uid: string;

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

        if (typeof payload.sub !== "string" || !payload.sub) {
          return Response.json(
            { error: "Invalid Firebase user identity" },
            { status: 401 },
          );
        }

        uid = payload.sub;
      } catch {
        return Response.json(
          { error: "Invalid or expired Firebase ID token" },
          { status: 401 },
        );
      }

      
      let file: File;

      try {
        const formData = await req.formData();
        const uploadedFile = formData.get("file");

        if (!(uploadedFile instanceof File)) {
          return Response.json(
            { error: "A document file is required" },
            { status: 400 },
          );
        }

        file = uploadedFile;
      } catch {
        return Response.json(
          { error: "Invalid form data" },
          { status: 400 },
        );
      }

      
      const extension = allowedTypes[file.type];

      if (!extension) {
        return Response.json(
          { error: "Only PDF, JPEG, and PNG files are allowed" },
          { status: 415 },
        );
      }

      if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: "File must be between 1 byte and 10 MiB" },
          { status: 413 },
        );
      }

      
      const filePath =
        `${uid}/${crypto.randomUUID()}.${extension}`;

      
      try {
        const { data, error } = await ctx.supabaseAdmin.storage
          .from(bucketName)
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          console.error("Storage upload failed:", error.message);

          return Response.json(
            { error: "Failed to upload ownership document" },
            { status: 500 },
          );
        }

        
        return Response.json(
          {
            message: "Document uploaded successfully",
            uid,
            documentPath: data.path,
          },
          { status: 201 },
        );
      } catch (error) {
        console.error("Unexpected upload error:", error);

        return Response.json(
          { error: "Unexpected upload error" },
          { status: 500 },
        );
      }
    },
  ),
};
