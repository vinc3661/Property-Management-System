import { useCallback, useEffect, useState } from "react";
import { getAdminApplications } from "../services/admin";

type AdminApplication = {
  id: string;
  applicantId: string;
  propertyName: string;
  propertyAddress: string;
  documentFileName: string;
  submittedAt: string | null;
  status: string;
  documentUrl: string | null;
};

function ApplicationCardSkeleton() {
  return (
    <article
      className="animate-pulse rounded-xl border border-gray-200 p-5"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-48 max-w-full rounded bg-gray-200" />
          <div className="h-4 w-64 max-w-full rounded bg-gray-200" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-3 w-56 max-w-full rounded bg-gray-200" />
        <div className="h-3 w-44 max-w-full rounded bg-gray-200" />
        <div className="h-3 w-40 max-w-full rounded bg-gray-200" />
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="h-10 w-48 max-w-full rounded-lg bg-gray-200" />
      </div>
    </article>
  );
}

export function AdminDashboard() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAdminApplications();
      const receivedApplications = result?.applications;

      setApplications(
        Array.isArray(receivedApplications) ? receivedApplications : []
      );
    } catch (err) {
      console.error("Failed to load applications:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const formatDate = (date: string | null) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString();
  };

  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    needs_information: "bg-orange-100 text-orange-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const pendingCount = applications.filter(
    (application) => application.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Review landlord applications and manage access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadApplications()}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh applications"}
          </button>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Applications retrieved
            </p>

            <div className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? (
                <span className="block h-9 w-12 animate-pulse rounded bg-gray-200" />
              ) : (
                applications.length
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Awaiting review
            </p>

            <div className="mt-2 text-3xl font-bold text-gray-900">
              {loading ? (
                <span className="block h-9 w-12 animate-pulse rounded bg-gray-200" />
              ) : (
                pendingCount
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Landlord Applications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review submitted property information and ownership documents.
            </p>
          </div>

          {loading ? (
            <div
              className="space-y-5"
              aria-busy="true"
              aria-label="Loading applications"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <ApplicationCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-red-50 p-4 text-red-700"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={() => void loadApplications()}
                className="rounded-lg border border-red-200 px-4 py-2 font-medium hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
              No applications currently require review.
            </p>
          ) : (
            <div className="space-y-5">
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {application.propertyName || "Unnamed property"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {application.propertyAddress || "Address not provided"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyle[application.status] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {application.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-gray-600">
                    <p className="break-all">
                      <strong className="text-gray-800">
                        Applicant UID:
                      </strong>{" "}
                      {application.applicantId}
                    </p>

                    <p>
                      <strong className="text-gray-800">
                        Document:
                      </strong>{" "}
                      {application.documentFileName || "Not specified"}
                    </p>

                    <p>
                      <strong className="text-gray-800">
                        Submitted:
                      </strong>{" "}
                      {formatDate(application.submittedAt)}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    {application.documentUrl ? (
                      <a
                        href={application.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                      >
                        View ownership document
                      </a>
                    ) : (
                      <p className="text-sm text-red-600">
                        Document link is unavailable. Refresh the applications
                        and try again.
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}