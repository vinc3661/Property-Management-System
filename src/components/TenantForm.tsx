
import { useState, type FormEvent } from "react";
import type { Tenant } from "../types/Tenant";
import type { Property } from "../types/Property";

type TenantFormProps = {
  properties: Property[];
  onAddTenant: (
    tenantData: Omit<Tenant, "id" | "landlordId">
  ) => Promise<void>;
};

export function TenantForm({
  properties,
  onAddTenant,
}: TenantFormProps) {
  const [name, setName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<Tenant["paymentStatus"]>("pending");
  const [leaseStart, setLeaseStart] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !propertyId || !leaseStart) {
      setError("Please complete all required fields.");
      return;
    }

    if (isSaving) return;

    const selectedProperty = properties.find(
      (property) => property.id === propertyId
    );

    if (!selectedProperty) {
      setError("Please select a valid property.");
      return;
    }

    try {
      setIsSaving(true);

      await onAddTenant({
        name: name.trim(),
        propertyId: selectedProperty.id,
        houseNumber: selectedProperty.houseNumber,
        paymentStatus,
        leaseStart,
      });

      setName("");
      setPropertyId("");
      setPaymentStatus("pending");
      setLeaseStart("");
    } catch (error) {
      console.error("Failed to register tenant:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to register tenant. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Register a Tenant
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Add a tenant and their rental information.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Tenant name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Select property
          </label>

          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            required
            disabled={properties.length === 0}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {properties.length === 0
                ? "No properties available"
                : "Choose a property"}
            </option>

            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                House {property.houseNumber}
              </option>
            ))}
          </select>

          {properties.length === 0 && (
            <p className="mt-2 text-xs text-amber-400">
              Add a property before registering a tenant.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Payment status
          </label>

          <select
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(
                e.target.value as Tenant["paymentStatus"]
              )
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Lease start date
          </label>

          <input
            type="date"
            value={leaseStart}
            onChange={(e) => setLeaseStart(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSaving || properties.length === 0}
          className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Registering..." : "Register Tenant"}
        </button>
      </div>
    </form>
  );
}
