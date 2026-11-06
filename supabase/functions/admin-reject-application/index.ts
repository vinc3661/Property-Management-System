
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
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
   
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

   
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: corsHeaders },
      );
    }

   
    if (!projectId || !adminUid) {
      return Response.json(
        { error: "Server configuration is incomplete" },
        { status: 500, headers: corsHeaders },
      );
    }

    try {
      
      const { firebaseIdToken, applicationId, reason } =
        await req.json();

      if (
        typeof firebaseIdToken !== "string" ||
        !firebaseIdToken.trim() ||
        typeof applicationId !== "string" ||
        !applicationId.trim() ||
        typeof reason !== "string" ||
        !reason.trim()
      ) {
        return Response.json(
          { error: "Firebase token, application ID and rejection reason are required" },
          { status: 400, headers: corsHeaders },
        );
      }

      
      const payload = await verifyFirebaseToken(firebaseIdToken);

      if (
        !payload.sub ||
        typeof payload.sub !== "string"
      ) {
        return Response.json(
          { error: "Invalid Firebase user" },
          { status: 401, headers: corsHeaders },
        );
      }

      if (payload.sub !== adminUid) {
        return Response.json(
          { error: "Unauthorized administrator" },
          { status: 403, headers: corsHeaders },
        );
      }

      
      const accessToken = await getFirestoreAccessToken();

      if (!accessToken) {
        return Response.json(
          { error: "Firestore access token unavailable" },
          { status: 500, headers: corsHeaders },
        );
      }
     
      const firestoreBase =
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

      const applicationResponse = await fetch(
        `${firestoreBase}/applicants/${encodeURIComponent(applicationId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (applicationResponse.status === 404) {
        return Response.json(
          { error: "Application not found" },
          { status: 404, headers: corsHeaders },
        );
      }

      if (!applicationResponse.ok) {
        return Response.json(
          { error: "Failed to fetch application" },
          { status: 500, headers: corsHeaders },
        );
      }

      
      const application = await applicationResponse.json();

      const applicantId =
        application.fields?.applicantId?.stringValue;

      const currentStatus =
        application.fields?.status?.stringValue;

      if (!applicantId) {
        return Response.json(
          { error: "Application applicant ID is missing" },
          { status: 400, headers: corsHeaders },
        );
      }

      
      const allowedStatuses = [
        "pending",
        "under_review",
        "needs_information",
      ];

      if (!allowedStatuses.includes(currentStatus)) {
        return Response.json(
          { error: "Application cannot be rejected in its current status" },
          { status: 409, headers: corsHeaders },
        );
      }
      return Response.json(
        { message: "Application fetched successfully. Rejection update is not implemented yet." },
        { status: 200, headers: corsHeaders },
      );
    } catch (error) {
      console.error("Reject application error:", error);

      return Response.json(
        { error: "Internal server error" },
        { status: 500, headers: corsHeaders },
      );
    }
  }),
};
