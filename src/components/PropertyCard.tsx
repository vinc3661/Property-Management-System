
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

  const handleEdit = () => {
    setHouseNumber(property.houseNumber);
    setStatus(property.status);
    setRentAmount(property.rentAmount);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setHouseNumber(property.houseNumber);
    setStatus(property.status);
    setRentAmount(property.rentAmount);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!houseNumber.trim() || rentAmount <= 0) return;

    try {
      setIsSaving(true);

      await onUpdate(property.id, {
        houseNumber: houseNumber.trim(),
        status,
        rentAmount,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update property:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(property.id);
    } catch (error) {
      console.error("Failed to delete property:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Card header */}
      <div className="flex items-start justify-between border-b border-gray-100 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Property
          </p>

          <h3 className="mt-1 text-xl font-bold text-gray-900">
            House {property.houseNumber}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            property.status === "occupied"
              ? "bg-blue-50 text-blue-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {property.status === "occupied" ? "Occupied" : "Vacant"}
        </span>
      </div>

      {isEditing ? (
        /* Edit form */
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              House number
            </label>

            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Monthly rent (KSh)
            </label>

            <input
              type="number"
              min="1"
              value={rentAmount}
              onChange={(e) => setRentAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Occupancy status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "occupied" | "vacant")
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Property details */
        <div className="p-5">
          <p className="text-sm text-gray-500">Monthly rental income</p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            KSh {property.rentAmount.toLocaleString("en-KE")}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
