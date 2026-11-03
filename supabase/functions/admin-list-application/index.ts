
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  verifyFirebaseToken,
  getFirestoreAccessToken,
} from "../_shared/firebase.ts";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
const adminUid = Deno.env.get("ADMIN_UID");

const bucketName =
  Deno.env.get("OWNERSHIP_DOCUMENTS_BUCKET") ??
  "landlord-ownership-documents";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, ctx) => {

      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: corsHeaders,
        });
      }

      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: corsHeaders }
        );
      }

      if (!projectId || !adminUid) {
        console.error("Required environment configuration is missing");

        return Response.json(
          { error: "Server configuration error" },
          { status: 500, headers: corsHeaders }
        );
      }

      try {
        
        const formData = await req.formData();
        const token = formData.get("firebaseIdToken");

        if (typeof token !== "string" || !token) {
          return Response.json(
            { error: "Firebase ID token is required" },
            { status: 401, headers: corsHeaders }
          );
        }

        
        const payload = await verifyFirebaseToken(token);
        const uid = payload.sub;

        
        if (adminUid !== payload.sub) {
          return Response.json(
            { error: "Unauthorized administrator account" },
            { status: 403, headers: corsHeaders }
          );
        }

        
        const accessToken = await getFirestoreAccessToken();

        
        const firestoreUrl =
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/applicants?pageSize=100`;

        const firestoreResponse = await fetch(firestoreUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!firestoreResponse.ok) {
          console.error(
            "Firestore application retrieval failed:",
            await firestoreResponse.text()
          );

          throw new Error("Could not retrieve applications");
        }

        const firestoreData = await firestoreResponse.json();
        const documents = firestoreData.documents ?? [];

      
        const applications = await Promise.all(
          documents.map(async (document: any) => {
            const fields = document.fields ?? {};

            const applicantId = fields.applicantId?.stringValue;
            const documentPath = fields.documentPath?.stringValue;
            const status = fields.status?.stringValue;

            if (
              !applicantId ||
              !documentPath ||
              !documentPath.startsWith(`${applicantId}/`) ||
              ![
                "pending",
                "under_review",
                "needs_information",
              ].includes(status)
            ) {
              return null;
            }

            const { data, error } =
              await ctx.supabaseAdmin.storage
                .from(bucketName)
                .createSignedUrl(documentPath, 300);

            if (error) {
              console.error(
                "Document link generation failed:",
                error.message
              );

              return null;
            }

            return {
              id: document.name.split("/").pop(),
              applicantId,
              propertyName:
                fields.propertyName?.stringValue ?? "",
              propertyAddress:
                fields.propertyAddress?.stringValue ?? "",
              documentFileName:
                fields.documentFileName?.stringValue ?? "",
              submittedAt:
                fields.submittedAt?.timestampValue ?? null,
              status,
              documentUrl: data.signedUrl,
            };
          })
        );

        
        return Response.json(
          {
            applications: applications.filter(
              (application) => application !== null
            ),
          },
          {
            status: 200,
            headers: corsHeaders,
          }
        );

      } catch (error) {
        console.error(
          "Admin application listing failed:",
          error instanceof Error ? error.message : "Unknown error"
        );

        return Response.json(
          { error: "Unable to retrieve applications" },
          { status: 500, headers: corsHeaders }
        );
      }
    }
  ),
};
