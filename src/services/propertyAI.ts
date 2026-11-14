
import { auth } from "./firebase";
import { supabase } from "./supabase";

export async function AskPropertyAi(question: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You have to be a signed-in user");
  }

  const token = await user.getIdToken();

  const { error, data } = await supabase.functions.invoke<{
    success: boolean;
    answer: string;
  }>("property-ai", {
    headers: {
      "x-firebase-id-token": token,
    },
    body: {
      question,
    },
  });

  if (error) {
    console.error("Supabase function failed:", error);
    throw new Error(error.message);
  }

  if (
    !data?.success ||
    typeof data.answer !== "string" ||
    !data.answer.trim()
  ) {
    console.error("Invalid AI response:", data);
    throw new Error("AI returned no valid answer");
  }

  return data.answer;
}
