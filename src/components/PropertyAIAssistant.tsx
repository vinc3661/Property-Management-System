
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
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">✦</span>
          <h2 className="text-lg font-semibold text-gray-900">
            Property AI Assistant
          </h2>
        </div>

        <p className="text-sm text-gray-500">
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
          className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {question.length}/1000 characters
          </p>

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </form>

      {loading && (
        <p className="mt-5 text-sm text-gray-500">
          Analysing your property records...
        </p>
      )}

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-5 rounded-xl bg-gray-50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            AI Response
          </h3>

          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {answer}
          </p>
        </div>
      )}
    </section>
  );
}
