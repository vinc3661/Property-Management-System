
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  verifyFirebaseToken,
  getFirestoreProfile,
  updateFirestoreProfile,
} from "../_shared/firebase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


async function hashToken(token: string): Promise<string> {
  const encodedToken = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", encodedToken);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}


function sendResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
}

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
        return sendResponse(
          { error: "Method not allowed" },
          405
        );
      }

      let invitationId: string | null = null;
      let firestoreUpdated = false;

      try {
        
        const body = await req.json();

        const rawToken =
          typeof body.token === "string"
            ? body.token.trim()
            : "";

        const firebaseIdToken =
          typeof body.firebaseIdToken === "string"
            ? body.firebaseIdToken
            : "";

        if (!rawToken) {
          return sendResponse(
            { error: "Invalid invitation token" },
            400
          );
        }

        if (!firebaseIdToken.trim()) {
          return sendResponse(
            { error: "Firebase authentication token is required" },
            401
          );
        }

        
        let payload;

        try {
          payload = await verifyFirebaseToken(firebaseIdToken);
        } catch {
          return sendResponse(
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
            { error: "Could not verify invitation" },
            500
          );
        }

        if (!invitation) {
          return sendResponse(
            { error: "Invalid invitation" },
            404
          );
        }

        invitationId = invitation.id;

        
        if (invitation.status !== "pending") {
          return sendResponse(
            { error: "This invitation is no longer available" },
            409
          );
        }

      
        if (
          new Date(invitation.expires_at).getTime() <= Date.now()
        ) {
          return sendResponse(
            { error: "This invitation has expired" },
            410
          );
        }

        
        if (
          caretakerEmail !==
          invitation.invited_email.trim().toLowerCase()
        ) {
          return sendResponse(
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
            { error: "The inviting account is no longer an approved landlord" },
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
            { error: "A landlord account cannot accept a caretaker invitation" },
            409
          );
        }

        
        if (existingRole === "caretaker") {
          if (existingLandlordId === invitation.landlord_id) {
            return sendResponse(
              { error: "This account is already linked to this landlord" },
              409
            );
          }

          return sendResponse(
            { error: "This account is already linked to another landlord" },
            409
          );
        }

        
        if (
          existingRole !== null ||
          existingLandlordId !== null
        ) {
          return sendResponse(
            { error: "Your profile has an inconsistent role or landlord assignment" },
            409
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
            { error: "Could not claim invitation" },
            500
          );
        }

        if (!claimedInvitation) {
          return sendResponse(
            { error: "Invitation was already used or has expired" },
            409
          );
        }


        try {
          await updateFirestoreProfile(caretakerId, {
            role: "caretaker",
            landlordId: invitation.landlord_id,
          });

          firestoreUpdated = true;
        } catch (error) {
          console.error("Firestore profile update failed:", error);

          
          await ctx.supabaseAdmin
            .from("caretaker_invitations")
            .update({ status: "pending" })
            .eq("id", invitation.id)
            .eq("status", "processing");

          return sendResponse(
            { error: "Could not assign caretaker profile" },
            500
          );
        }

       
        const { error: acceptanceError } =
          await ctx.supabaseAdmin
            .from("caretaker_invitations")
            .update({
              status: "accepted",
              accepted_at: new Date().toISOString(),
            })
            .eq("id", invitation.id)
            .eq("status", "processing");

        if (acceptanceError) {
          console.error(
            "Invitation finalisation error:",
            acceptanceError
          );

          return sendResponse(
            {
              error: "Caretaker profile assigned, but invitation finalisation failed. Administrator recovery is required.",
            },
            500
          );
        }

        
        return sendResponse({
          message: "Invitation accepted successfully",
          role: "caretaker",
          landlordId: invitation.landlord_id,
        });

      } catch (error) {
        console.error("Accept invitation error:", error);

        if (invitationId && !firestoreUpdated) {
          await ctx.supabaseAdmin
            .from("caretaker_invitations")
            .update({ status: "pending" })
            .eq("id", invitationId)
            .eq("status", "processing");
        }

        return sendResponse(
          { error: "Unable to accept invitation" },
          500
        );
      }
    }
  ),
};
