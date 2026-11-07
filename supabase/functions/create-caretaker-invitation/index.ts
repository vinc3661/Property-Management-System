
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  verifyFirebaseToken,
  getFirestoreProfile,
} from "../_shared/firebase.ts";

import { createRateLimiter } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const appUrl = (
  Deno.env.get("APP_URL") ?? "http://localhost:5173"
).replace(/\/$/, "");

const INVITATION_EXPIRY_HOURS = 48;


const applicationLimiter = createRateLimiter({
  limit: 5,
  window: "1 h",
  prefix: "pms:create-caretaker-invitation",
});

function generateSecureToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
        return new Response("ok", { headers: corsHeaders });
      }

      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: corsHeaders }
        );
      }

      try {
        const body = await req.body();

        const email =
          typeof body.email === "string"
            ? body.email.trim().toLowerCase()
            : "";

        const firebaseIdToken =
          typeof body.firebaseIdToken === "string"
            ? body.firebaseIdToken
            : "";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json(
            { error: "A valid caretaker email is required" },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!firebaseIdToken) {
          return Response.json(
            { error: "Firebase ID token is required" },
            { status: 401, headers: corsHeaders }
          );
        }

        
        const payload = await verifyFirebaseToken(firebaseIdToken);

        if (payload.email_verified !== true) {
          return Response.json(
            { error: "Please verify your email before inviting caretakers" },
            { status: 403, headers: corsHeaders }
          );
        }

        const landlordId = payload.sub;

        if (typeof landlordId !== "string" || !landlordId) {
          return Response.json(
            { error: "Could not identify the signed-in user" },
            { status: 401, headers: corsHeaders }
          );
        }

        
        const profile = await getFirestoreProfile(landlordId);

        const role = profile.fields?.role?.stringValue;

        if (role !== "landlord") {
          return Response.json(
            { error: "Only approved landlords can invite caretakers" },
            { status: 403, headers: corsHeaders }
          );
        }

        
        let rateLimitResult;

        try {
          rateLimitResult = await applicationLimiter.limit(landlordId);
        } catch (error) {
          console.error(
            "Rate limiter unavailable:",
            error instanceof Error ? error.message : "Unknown error"
          );

          return Response.json(
            {
              error:
                "Rate-limiting service temporarily unavailable. Please try again later.",
            },
            {
              status: 503,
              headers: corsHeaders,
            }
          );
        }

        if (!rateLimitResult.success) {
          const retryAfter = Math.max(
            1,
            Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
          );

          return Response.json(
            {
              error: "Too many invitation requests. Please try again later.",
              retryAfter,
            },
            {
              status: 429,
              headers: {
                ...corsHeaders,
                "Retry-After": String(retryAfter),
              },
            }
          );
        }

        
        const rawToken = generateSecureToken();
        const tokenHash = await hashToken(rawToken);

      
        const expiresAt = new Date(
          Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000
        ).toISOString();

        
        const { error: insertError } = await ctx.supabaseAdmin
          .from("caretaker_invitations")
          .insert({
            token_hash: tokenHash,
            landlord_id: landlordId,
            invited_email: email,
            status: "pending",
            expires_at: expiresAt,
          });

        if (insertError) {
          console.error("Invitation insert failed:", insertError);

          return Response.json(
            { error: "Could not create invitation" },
            { status: 500, headers: corsHeaders }
          );
        }

        
        const invitationUrl = `${appUrl}/invite/${rawToken}`;

        return Response.json(
          {
            message: "Invitation created successfully",
            invitationUrl,
            invitedEmail: email,
            expiresAt,
          },
          { status: 201, headers: corsHeaders }
        );
      } catch (error) {
        console.error("Create invitation error:", error);

        return Response.json(
          { error: "Unable to create caretaker invitation" },
          { status: 500, headers: corsHeaders }
        );
      }
    }
  ),
};
