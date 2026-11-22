
import { useState } from "react";
import type { Property } from "../types/Property";

type PropertyCardProps = {
  property: Property;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    updates: Partial<Omit<Property, "id">>
  ) => Promise<void>;
};

export function PropertyCard({
  property,
  onDelete,
  onUpdate,
}: PropertyCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [houseNumber, setHouseNumber] = useState(property.houseNumber);
  const [status, setStatus] = useState<"occupied" | "vacant">(
    property.status
  );
  const [rentAmount, setRentAmount] = useState(property.rentAmount);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleEdit = () => {
    setHouseNumber(property.houseNumber);
    setStatus(property.status);
    setRentAmount(property.rentAmount);
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setHouseNumber(property.houseNumber);
    setStatus(property.status);
    setRentAmount(property.rentAmount);
    setError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setError("");

    if (!houseNumber.trim()) {
      setError("House number is required.");
      return;
    }

    if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
      setError("Enter a valid monthly rent amount.");
      return;
    }

    try {
      setIsSaving(true);

      await onUpdate(property.id, {
        houseNumber: houseNumber.trim(),
        status,
        rentAmount,
      });

      setIsEditing(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update property."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete House ${property.houseNumber}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      setIsDeleting(true);
      await onDelete(property.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete property."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition duration-200 hover:border-zinc-700">
      <div className="flex items-start justify-between border-b border-zinc-800 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Property
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            House {property.houseNumber}
          </h3>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            property.status === "occupied"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700 bg-zinc-900 text-zinc-400"
          }`}
        >
          {property.status === "occupied" ? "Occupied" : "Vacant"}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              House number
            </label>

            <input
              type="text"
              value={houseNumber}
              onChange={(event) => setHouseNumber(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Monthly rent (KSh)
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={rentAmount}
              onChange={(event) => setRentAmount(Number(event.target.value))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Occupancy status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "occupied" | "vacant")
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <p className="text-sm text-zinc-400">
            Monthly rental income
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            KSh {property.rentAmount.toLocaleString("en-KE")}
          </p>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={handleEdit}
              disabled={isDeleting}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-black bg-white transition hover:bg-zinc-900 disabled:opacity-50"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg px-4 py-2 bg-white text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
