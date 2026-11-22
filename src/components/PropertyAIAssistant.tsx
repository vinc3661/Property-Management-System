
import { useState, type FormEvent } from "react";
import { AskPropertyAi } from "../services/propertyAI";

export function PropertyAIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim() || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await AskPropertyAi(question.trim());
      setAnswer(response);
    } catch (err) {
      console.error("Property AI request failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Property AI Assistant
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Ask questions about your properties and tenants.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. How many vacant units do I currently have?"
          rows={3}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {question.length}/1000 characters
          </p>

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </form>

      {loading && (
        <p className="mt-5 text-sm text-emerald-400">
          Analysing your property records...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-2 text-sm font-semibold text-emerald-400">
            AI Response
          </h3>

          <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
            {answer}
          </p>
        </div>
      )}
    </section>
  );
}
