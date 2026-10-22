
import { useState } from "react";
import { LandlordRegisterForm } from "./LandlordRegistrationForm";
import OwnershipDocumentStep from "./OwnershipDocumentStep";
import { submitLandlordApplication } from "../../services/firebase";

export function LandlordApplicationFlow() {
  const [step, setStep] = useState(1);
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [ownershipDocument, setOwnershipDocument] =
    useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitApplication = async () => {
    if (!ownershipDocument) {
      setError("Please select an ownership document.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await submitLandlordApplication(
        propertyName,
        propertyAddress,
        ownershipDocument
      );

      setIsSubmitted(true);
    } catch (err) {
      console.error("Application submission failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-green-700">
          Application submitted!
        </h2>
        <p className="mt-3 text-gray-600">
          Your ownership document was uploaded and your application
          was saved. Your application is pending review.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Property: {propertyName}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-lg">
      {step === 1 && (
        <LandlordRegisterForm
          onRegisterLandlord={(name, address) => {
            setPropertyName(name);
            setPropertyAddress(address);
            setError("");
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <OwnershipDocumentStep
          onContinue={(file) => {
            setOwnershipDocument(file);
            setError("");
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold">
            Review your application
          </h2>

          <p className="mt-4">
            <strong>Property:</strong> {propertyName}
          </p>
          <p className="mt-2">
            <strong>Address:</strong> {propertyAddress}
          </p>
          <p className="mt-2 break-words">
            <strong>Document:</strong>{" "}
            {ownershipDocument?.name ?? "No document selected"}
          </p>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setError("");
                setStep(2);
              }}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Back
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setError("");
                setStep(1);
              }}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Edit property details
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitApplication}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit application"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
