
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  verifyFirebaseToken,
  getFirestoreProfile,
  updateFirestoreProfile,
} from "../_shared/firebase.ts";

// CORS configuration
const allowedOrigins = new Set([
  "http://localhost:5173",
]);

const appUrl = Deno.env.get("APP_URL");

if (appUrl) {
  allowedOrigins.add(new URL(appUrl).origin);
}

const corsHeaders = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
};

function getCorsHeaders(req: Request) {
  const headers = new Headers(corsHeaders);
  const origin = req.headers.get("Origin");

  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

function sendResponse(
  req: Request,
  body: Record<string, unknown>,
  status = 200
) {
  return Response.json(body, {
    status,
    headers: getCorsHeaders(req),
  });
}


async function hashToken(token: string): Promise<string> {
  const encodedToken = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", encodedToken);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
    async (req, ctx) => {

      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: getCorsHeaders(req),
        });
      }

      if (req.method !== "POST") {
        return sendResponse(
          req,
          { error: "Method not allowed" },
          405
        );
      }

      try {

        // 1. Read request body
        const body = await req.json();

        const rawToken =
          typeof body.token === "string"
            ? body.token.trim()
            : "";

        const firebaseIdToken =
          typeof body.firebaseIdToken === "string"
            ? body.firebaseIdToken
            : "";

       
        if (!/^[a-fA-F0-9]{64}$/.test(rawToken)) {
          return sendResponse(
            req,
            { error: "Invalid invitation token" },
            400
          );
        }

        if (!firebaseIdToken.trim()) {
          return sendResponse(
            req,
            { error: "Firebase authentication token is required" },
            401
          );
        }

        
        let payload;

        try {
          payload = await verifyFirebaseToken(firebaseIdToken);
        } catch {
          return sendResponse(
            req,
            { error: "Invalid or expired Firebase authentication token" },
            401
          );
        }

        const caretakerId = payload.sub;

        const caretakerEmail =
          typeof payload.email === "string"
            ? payload.email.trim().toLowerCase()
            : "";

        if (
          !caretakerId ||
          !caretakerEmail ||
          payload.email_verified !== true
        ) {
          return sendResponse(
            req,
            { error: "A verified Firebase email account is required" },
            403
          );
        }

        
        const tokenHash = await hashToken(rawToken);

        const { data: invitation, error: lookupError } =
          await ctx.supabaseAdmin
            .from("caretaker_invitations")
            .select("*")
            .eq("token_hash", tokenHash)
            .maybeSingle();

        if (lookupError) {
          console.error("Invitation lookup error:", lookupError);

          return sendResponse(
            req,
            { error: "Could not verify invitation" },
            500
          );
        }

        if (!invitation) {
          return sendResponse(
            req,
            { error: "Invalid invitation" },
            404
          );
        }

        // 4. Validate invitation status
        if (
          invitation.status !== "pending" &&
          invitation.status !== "processing"
        ) {
          return sendResponse(
            req,
            { error: "This invitation is no longer available" },
            409
          );
        }

      
        if (
          invitation.status === "pending" &&
          new Date(invitation.expires_at).getTime() <= Date.now()
        ) {
          return sendResponse(
            req,
            { error: "This invitation has expired" },
            410
          );
        }

        // 5. Verify invited email
        if (
          caretakerEmail !==
          invitation.invited_email.trim().toLowerCase()
        ) {
          return sendResponse(
            req,
            { error: "This invitation belongs to another email address" },
            403
          );
        }

       
        const landlordProfile = await getFirestoreProfile(
          invitation.landlord_id
        );

        const landlordRole =
          landlordProfile.fields?.role?.stringValue ?? null;

        if (landlordRole !== "landlord") {
          return sendResponse(
            req,
            {
              error: "The inviting account is no longer an approved landlord",
            },
            403
          );
        }

       
        const caretakerProfile = await getFirestoreProfile(
          caretakerId
        );

        const existingRole =
          caretakerProfile.fields?.role?.stringValue ?? null;

        const existingLandlordId =
          caretakerProfile.fields?.landlordId?.stringValue ?? null;

      
        if (existingRole === "landlord") {
          return sendResponse(
            req,
            {
              error: "A landlord account cannot accept a caretaker invitation",
            },
            409
          );
        }

        if (existingRole === "caretaker") {

          /
          if (
            existingLandlordId === invitation.landlord_id &&
            invitation.status === "processing"
          ) {
            const { data: finalizedInvitation, error: finalizationError } =
              await ctx.supabaseAdmin
                .from("caretaker_invitations")
                .update({
                  status: "accepted",
                  accepted_at: new Date().toISOString(),
                })
                .eq("id", invitation.id)
                .eq("status", "processing")
                .select("id")
                .maybeSingle();

            if (finalizationError) {
              console.error(
                "Invitation recovery error:",
                finalizationError
              );

              return sendResponse(
                req,
                {
                  error: "Caretaker is assigned, but invitation recovery failed",
                },
                500
              );
            }

            if (!finalizedInvitation) {
              return sendResponse(
                req,
                { error: "Invitation could not be finalized" },
                409
              );
            }

            return sendResponse(req, {
              message: "Invitation acceptance recovered successfully",
              role: "caretaker",
              landlordId: invitation.landlord_id,
            });
          }

          if (existingLandlordId === invitation.landlord_id) {
            return sendResponse(
              req,
              {
                error: "This account is already linked to this landlord",
              },
              409
            );
          }

          return sendResponse(
            req,
            {
              error: "This account is already linked to another landlord",
            },
            409
          );
        }

        if (
          existingRole !== null ||
          existingLandlordId !== null
        ) {
          return sendResponse(
            req,
            {
              error: "Your profile has an inconsistent role or landlord assignment",
            },
            409
          );
        }

        if (invitation.status === "processing") {
          return sendResponse(
            req,
            {
              error: "This invitation is still processing and requires recovery",
            },
            409
          );
        }

        
        if (
          typeof caretakerProfile.updateTime !== "string" ||
          !caretakerProfile.updateTime
        ) {
          console.error("Caretaker profile is missing updateTime");

          return sendResponse(
            req,
            { error: "Could not verify caretaker profile version" },
            500
          );
        }

       
        const { data: claimedInvitation, error: claimError } =
          await ctx.supabaseAdmin
            .from("caretaker_invitations")
            .update({ status: "processing" })
            .eq("id", invitation.id)
            .eq("status", "pending")
            .gt("expires_at", new Date().toISOString())
            .select("id")
            .maybeSingle();

        if (claimError) {
          console.error("Invitation claim error:", claimError);

          return sendResponse(
            req,
            { error: "Could not claim invitation" },
            500
          );
        }

        if (!claimedInvitation) {
          return sendResponse(
            req,
            { error: "Invitation was already used or has expired" },
            409
          );
        }

       
        try {
          await updateFirestoreProfile(
            caretakerId,
            {
              role: "caretaker",
              landlordId: invitation.landlord_id,
            },
            caretakerProfile.updateTime
          );

        } catch (error) {
          console.error("Firestore profile update failed:", error);

          if (
            error instanceof Error &&
            error.message === "PROFILE_VERSION_CONFLICT"
          ) {
            const { error: resetError } =
              await ctx.supabaseAdmin
                .from("caretaker_invitations")
                .update({ status: "pending" })
                .eq("id", invitation.id)
                .eq("status", "processing");

            if (resetError) {
              console.error(
                "Invitation reset after conflict failed:",
                resetError
              );
            }

            return sendResponse(
              req,
              {
                error: "Your profile changed during acceptance. Please try again.",
              },
              409
            );
          }

          return sendResponse(
            req,
            { error: "Could not assign caretaker profile. Please retry." },
            500
          );
        }

      
        const { data: finalizedInvitation, error: acceptanceError } =
          await ctx.supabaseAdmin
            .from("caretaker_invitations")
            .update({
              status: "accepted",
              accepted_at: new Date().toISOString(),
            })
            .eq("id", invitation.id)
            .eq("status", "processing")
            .select("id")
            .maybeSingle();

        if (acceptanceError) {
          console.error(
            "Invitation finalization error:",
            acceptanceError
          );

          return sendResponse(
            req,
            {
              error: "Caretaker profile assigned, but invitation finalization failed. Please retry.",
            },
            500
          );
        }

        if (!finalizedInvitation) {
          return sendResponse(
            req,
            {
              error: "Caretaker profile assigned, but invitation could not be finalized.",
            },
            409
          );
        }

        
        return sendResponse(req, {
          message: "Invitation accepted successfully",
          role: "caretaker",
          landlordId: invitation.landlord_id,
        });

      } catch (error) {
        console.error("Accept invitation error:", error);

        return sendResponse(
          req,
          { error: "Unable to accept invitation" },
          500
        );
      }
    }
  ),
};
