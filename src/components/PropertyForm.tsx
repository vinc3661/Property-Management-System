
import { useState, type FormEvent } from "react";
import type { Property } from "../types/Property";

type PropertyFormProps = {
  onAddProperty: (
    newPropertyData: Omit<Property, "id" | "landlordId">
  ) => Promise<void>;
};

export function PropertyForm({ onAddProperty }: PropertyFormProps) {
  const [houseNumber, setHouseNumber] = useState("");
  const [rentAmount, setRentAmount] = useState<number | "">("");
  const [status, setStatus] = useState<"occupied" | "vacant">("vacant");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!houseNumber.trim()) {
      setError("House number is required.");
      return;
    }

    if (rentAmount === "" || !Number.isFinite(rentAmount) || rentAmount <= 0) {
      setError("Enter a valid monthly rent amount.");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await onAddProperty({
        houseNumber: houseNumber.trim(),
        rentAmount,
        status,
      });

      setHouseNumber("");
      setRentAmount("");
      setStatus("vacant");
    } catch (error) {
      console.error("Failed to add property:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add property. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Add Property
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Add a new rental unit to your property portfolio.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            House number
          </label>

          <input
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            placeholder="Enter house number"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Monthly rent (KSh)
          </label>

          <input
            type="number"
            min="1"
            step="0.01"
            value={rentAmount}
            onChange={(e) =>
              setRentAmount(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder="Enter rent amount"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Occupancy status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "occupied" | "vacant")
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Adding property..." : "Add Property"}
      </button>
    </form>
  );
}
