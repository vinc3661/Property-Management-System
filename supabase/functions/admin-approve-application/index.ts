
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  verifyFirebaseToken,
  getFirestoreAccessToken,
} from "../_shared/firebase.ts";

const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
const adminUid = Deno.env.get("ADMIN_UID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, _ctx) => {

      
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
        console.error("Missing server configuration");

        return Response.json(
          { error: "Server configuration error" },
          { status: 500, headers: corsHeaders }
        );
      }

      try {

    
        const body = await req.json();

        const { firebaseIdToken, applicationId } = body;

        if (
          typeof firebaseIdToken !== "string" ||
          !firebaseIdToken ||
          typeof applicationId !== "string" ||
          !applicationId.trim()
        ) {
          return Response.json(
            { error: "Firebase token and application ID are required" },
            { status: 400, headers: corsHeaders }
          );
        }

        
        const payload = await verifyFirebaseToken(firebaseIdToken);

        if (typeof payload.sub !== "string" || !payload.sub) {
          return Response.json(
            { error: "Invalid user identity" },
            { status: 401, headers: corsHeaders }
          );
        }

        
        if (payload.sub !== adminUid) {
          return Response.json(
            { error: "Unauthorized administrator account" },
            { status: 403, headers: corsHeaders }
          );
        }

      
        const googleToken = await getFirestoreAccessToken();

        
        const firestoreBase =
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

        
        const applicationResponse = await fetch(
          `${firestoreBase}/applicants/${encodeURIComponent(applicationId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${googleToken}`,
            },
          }
        );

        if (applicationResponse.status === 404) {
          return Response.json(
            { error: "Application not found" },
            { status: 404, headers: corsHeaders }
          );
        }

        if (!applicationResponse.ok) {
          throw new Error("Failed to retrieve application");
        }

        const application = await applicationResponse.json();

        const applicantId =
          application.fields?.applicantId?.stringValue;

        const status =
          application.fields?.status?.stringValue;

        if (!applicantId) {
          return Response.json(
            { error: "Application has no valid applicant ID" },
            { status: 400, headers: corsHeaders }
          );
        }

      
        const allowedStatuses = [
          "pending",
          "under_review",
          "needs_information",
        ];

        if (!allowedStatuses.includes(status)) {
          return Response.json(
            { error: "Application cannot be approved in its current state" },
            { status: 409, headers: corsHeaders }
          );
        }


        const profileResponse = await fetch(
          `${firestoreBase}/profiles/${encodeURIComponent(applicantId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${googleToken}`,
            },
          }
        );

        if (profileResponse.status === 404) {
          return Response.json(
            { error: "Applicant profile not found" },
            { status: 404, headers: corsHeaders }
          );
        }

        if (!profileResponse.ok) {
          throw new Error("Failed to retrieve applicant profile");
        }

        const profile = await profileResponse.json();

        const role =
          profile.fields?.role?.stringValue ?? null;

        const landlordId =
          profile.fields?.landlordId?.stringValue ?? null;

      
        if (role !== null || landlordId !== null) {
          return Response.json(
            { error: "Applicant already has an assigned role or workspace" },
            { status: 409, headers: corsHeaders }
          );
        }

        
        const commitResponse = await fetch(
          `${firestoreBase}:commit`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${googleToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              writes: [

              
                {
                  update: {
                    name: application.name,
                    fields: {
                      status: {
                        stringValue: "approved",
                      },
                    },
                  },
                  updateMask: {
                    fieldPaths: ["status"],
                  },
                  currentDocument: {
                    updateTime: application.updateTime,
                  },
                },

                
                {
                  update: {
                    name: profile.name,
                    fields: {
                      role: {
                        stringValue: "landlord",
                      },
                      landlordId: {
                        stringValue: applicantId,
                      },
                    },
                  },
                  updateMask: {
                    fieldPaths: ["role", "landlordId"],
                  },
                  currentDocument: {
                    updateTime: profile.updateTime,
                  },
                },

              ],
            }),
          }
        );

        if (!commitResponse.ok) {
          const errorDetails = await commitResponse.text();

          console.error("Firestore commit failed:", errorDetails);

          if (
            commitResponse.status === 409 ||
            commitResponse.status === 400
          ) {
            return Response.json(
              { error: "Application or profile changed. Refresh and try again." },
              { status: 409, headers: corsHeaders }
            );
          }

          throw new Error("Could not approve application");
        }

        
        return Response.json(
          {
            success: true,
            message: "Landlord application approved successfully",
            applicantId,
            applicationId,
          },
          {
            status: 200,
            headers: corsHeaders,
          }
        );

      } catch (error) {

        console.error(
          "Admin application approval failed:",
          error instanceof Error ? error.message : "Unknown error"
        );

        return Response.json(
          { error: "Unable to approve application" },
          { status: 500, headers: corsHeaders }
        );
      }
    }
  ),
};
