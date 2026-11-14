
import { useState, type FormEvent } from "react";
import { inviteCaretaker } from "../services/invitation";

type Invitation = {
  invitationUrl: string;
  invitedEmail: string;
  expiresAt: string;
};

export function CaretakersPage() {
  const [email, setEmail] = useState("");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setInvitation(null);
    setCopied(false);

    if (!email.trim()) {
      setError("Please enter the caretaker's email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await inviteCaretaker(email);

      setInvitation({
        invitationUrl: result.invitationUrl,
        invitedEmail: result.invitedEmail,
        expiresAt: result.expiresAt,
      });

      setEmail("");
    } catch (err) {
      console.error("Failed to invite caretaker:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create invitation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!invitation) return;

    try {
      await navigator.clipboard.writeText(invitation.invitationUrl);
      setCopied(true);
    } catch {
      setError("Could not copy the invitation link. Please copy it manually.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Caretakers
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Invite someone to help manage your properties.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          Invite a caretaker
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Enter their email address. They will receive access through
          the invitation link you share with them.
        </p>

        <form onSubmit={handleInvite} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="caretaker-email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Caretaker email address
            </label>

            <input
              id="caretaker-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="caretaker@example.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating invitation..." : "Send invitation"}
          </button>
        </form>
      </div>

      {invitation && (
        <div className="max-w-2xl rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-2">
            <span className="text-green-700">✓</span>
            <h3 className="font-semibold text-green-900">
              Invitation created successfully
            </h3>
          </div>

          <p className="mt-3 text-sm text-gray-700">
            Invitation for <strong>{invitation.invitedEmail}</strong>
          </p>

          <div className="mt-4 break-all rounded-lg border border-green-200 bg-white p-3 text-sm text-gray-700">
            {invitation.invitationUrl}
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="mt-3 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            {copied ? "Link copied!" : "Copy invitation link"}
          </button>

          <p className="mt-4 text-xs text-gray-600">
            Expires: {new Date(invitation.expiresAt).toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Share this link with the caretaker. It expires after 48 hours.
          </p>
        </div>
      )}
    </div>
  );
}
