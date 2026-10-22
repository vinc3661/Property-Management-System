
import { useState } from "react";

type OwnershipDocumentStepProps = {
  onContinue: (file: File) => void;
};

const OwnershipDocumentStep = ({
  onContinue,
}: OwnershipDocumentStepProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleContinue = () => {
    setIsValid(false);

    if (!selectedFile) {
      setError("Please select an ownership document");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File must be 5MB or smaller");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF, JPEG, and PNG files are allowed.");
      return;
    }

    setError("");
    setIsValid(true);
    onContinue(selectedFile);
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-7">
        <p className="text-sm font-medium text-blue-600">
          LANDLORD REGISTRATION · STEP 2 OF 3
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Upload ownership document
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Upload a document that verifies your property ownership.
        </p>
      </div>

      <label
        htmlFor="ownership-document"
        className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
          </svg>
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-800">
          {selectedFile
            ? "Choose a different file"
            : "Choose an ownership document"}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          PDF, JPEG or PNG · Maximum 5 MB
        </p>

        <input
          id="ownership-document"
          type="file"
          accept="application/pdf, image/jpeg, image/png"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;

            setSelectedFile(file);
            setIsValid(false);

            if (file) {
              setError("");
            }
          }}
        />
      </label>

      {selectedFile && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-semibold text-blue-700">
            {selectedFile.name.split(".").pop()?.toUpperCase() ?? "FILE"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {isValid && (
        <p className="mt-3 text-sm font-medium text-emerald-600">
          Document passed validation.
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Continue
        <span className="ml-2" aria-hidden="true">
          →
        </span>
      </button>
    </div>
  );
};

export default OwnershipDocumentStep;
