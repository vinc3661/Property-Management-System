import { auth } from "./firebase";
import { supabase } from "./supabase";

type InvitationResponse = {
  message: string;
  invitationUrl: string;
  invitedEmail: string;
  expiresAt: string;
};

export async function inviteCaretaker(
  email: string
): Promise<InvitationResponse> {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("No signed-in user");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Caretaker email is required");
  }

  
  const firebaseIdToken = await user.getIdToken();

  
  const { data, error } =
    await supabase.functions.invoke<InvitationResponse>(
      "create-caretaker-invitation",
      {
        body: {
          email: normalizedEmail,
          firebaseIdToken,
        },
      }
    );

  if (error) {
    console.error("Invitation function failed:", error);
    throw error;
  }

  if (!data?.invitationUrl) {
    throw new Error("Invitation URL was not returned");
  }

  return data;
}