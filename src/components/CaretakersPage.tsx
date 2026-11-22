
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

    if (loading) return;

    setError("");
    setInvitation(null);
    setCopied(false);

    if (!email.trim()) {
      setError("Please enter the caretaker's email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await inviteCaretaker(email.trim());

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
      setError("");
    } catch {
      setError(
        "Could not copy the invitation link. Please copy it manually."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Caretakers
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Invite someone to help manage your properties.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h3 className="text-lg font-semibold text-white">
          Invite a Caretaker
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Enter their email address. They will receive access through
          the invitation link you share with them.
        </p>

        <form onSubmit={handleInvite} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="caretaker-email"
              className="mb-2 block text-sm font-medium text-zinc-300"
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating invitation..." : "Send invitation"}
          </button>
        </form>
      </div>

      {invitation && (
        <div className="max-w-2xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <h3 className="font-semibold text-emerald-400">
            Invitation created successfully
          </h3>

          <p className="mt-3 text-sm text-zinc-300">
            Invitation for{" "}
            <strong className="text-white">
              {invitation.invitedEmail}
            </strong>
          </p>

          <div className="mt-4 break-all rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
            {invitation.invitationUrl}
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="mt-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            {copied ? "Link copied!" : "Copy invitation link"}
          </button>

          <p className="mt-4 text-xs text-zinc-500">
            Expires: {new Date(invitation.expiresAt).toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Share this link with the caretaker. It expires after 48 hours.
          </p>
        </div>
      )}
    </div>
  );
}
