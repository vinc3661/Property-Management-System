
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "../services/firebase";
import { acceptCaretakerInvitation } from "../services/acceptance";

type AcceptanceCodeProps = {
  invitationToken: string;
};

export function AcceptanceCode({
  invitationToken,
}: AcceptanceCodeProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  async function handleAcceptInvitation() {
    setError("");

    if (!user) {
      setError("Please sign in before accepting this invitation.");
      return;
    }

    if (!invitationToken) {
      setError("The invitation link is missing its token.");
      return;
    }

    try {
      setIsAccepting(true);

      await acceptCaretakerInvitation(invitationToken);

      setSuccess(true);
    } catch (err) {
      console.error("Invitation acceptance failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept invitation. Please try again."
      );
    } finally {
      setIsAccepting(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p>Checking your sign-in status...</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-semibold text-green-700">
            Invitation accepted!
          </h1>

          <p className="mb-6 text-gray-600">
            Your account has been linked to the landlord's workspace.
            You can now continue to your dashboard.
          </p>

          <button
            onClick={() => window.location.assign("/")}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800"
          >
            Continue to dashboard
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-2xl font-semibold text-gray-900">
          Caretaker invitation
        </h1>

        <p className="mb-6 text-gray-600">
          You've been invited to join a landlord's property
          management workspace as a caretaker.
        </p>

        {user ? (
          <>
            <div className="mb-5 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Signed in as
              </p>

              <p className="font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <p className="mb-5 text-sm text-gray-600">
              Make sure this is the email address the invitation
              was sent to.
            </p>

            <button
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAccepting
                ? "Accepting invitation..."
                : "Accept invitation"}
            </button>
          </>
        ) : (
          <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            Please sign in to your PMS account using the email
            address that received this invitation. Then reopen
            this invitation link.
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
