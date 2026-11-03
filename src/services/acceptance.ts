import { auth } from "./firebase";
import { supabase } from "./supabase";

export async function acceptCaretakerInvitation(token: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first");
  }

  const firebaseIdToken = await user.getIdToken();

  const { data, error } = await supabase.functions.invoke(
    "accept-caretaker-invitation",
    {
      body: {
        token,
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