
import { useState } from "react";

type OwnershipDocumentStepProps = {
  onContinue: (file: File) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export function OwnershipDocumentStep({
  onContinue,
}: OwnershipDocumentStepProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (file: File | null) => {
    setError("");
    setSelectedFile(null);

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File must be 5 MB or smaller.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, JPEG, and PNG files are allowed.");
      return;
    }

    setSelectedFile(file);
  };

  const handleContinue = () => {
    if (!selectedFile) {
      setError("Please select an ownership document.");
      return;
    }

    setError("");
    onContinue(selectedFile);
  };

  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">

      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-7 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest text-zinc-400">
            LANDLORD REGISTRATION
          </span>

          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            STEP 2 OF 3
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Verify property ownership
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Upload a document that helps us verify your ownership
          of the property.
        </p>
      </div>

      
      <div className="px-6 py-7 sm:px-8">
        <label
          htmlFor="ownership-document"
          className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-5 py-10 text-center transition ${
            selectedFile
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900"
          }`}
        >
          <p className="text-sm font-semibold text-white">
            {selectedFile
              ? "Choose a different document"
              : "Upload ownership document"}
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            Click to browse and select your document.
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            PDF, JPEG or PNG · Maximum 5 MB
          </p>

          <input
            id="ownership-document"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              handleFileChange(file);
              e.target.value = "";
            }}
          />
        </label>

        
        {selectedFile && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setError("");
              }}
              className="rounded-lg px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              Remove
            </button>
          </div>
        )}

        
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-3 text-sm text-red-400"
          >
            {error}
          </p>
        )}

      
        <button
          type="button"
          onClick={handleContinue}
          className="mt-7 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.99]"
        >
          Continue
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
          Your document will be securely submitted for verification.
        </p>
      </div>
    </div>
  );
}
