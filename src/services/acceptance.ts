
import { auth } from "./firebase";
import { supabase } from "./supabase";

export async function acceptCaretakerInvitation(
  invitationToken: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No signed-in user");
  }

  if (!invitationToken) {
    throw new Error("No invitation token provided");
  }

  const firebaseIdToken = await user.getIdToken();

  const { data, error } = await supabase.functions.invoke(
    "accept-caretaker-invitation",
    {
      body: {
        token: invitationToken,
        firebaseIdToken,
      },
    }
  );

  if (error) {
    console.error("Invitation acceptance failed:", error);
    throw error;
  }

  return data;
}
