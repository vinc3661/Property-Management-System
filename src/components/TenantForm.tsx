
import { useState } from "react";
import type { Tenant } from "../types/Tenant";

type TenantFormProps = {
  onAddTenant: (
    tenantData: Omit<Tenant, "id" | "landlordId">
  ) => Promise<void>;
};

export function TenantForm({ onAddTenant }: TenantFormProps) {
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<Tenant["paymentStatus"]>("pending");
  const [leaseStart, setLeaseStart] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !houseNumber.trim() || !leaseStart) {
      return;
    }

    try {
      setIsSaving(true);

      await onAddTenant({
        name: name.trim(),
        houseNumber: houseNumber.trim(),
        paymentStatus,
        leaseStart,
      });

      setName("");
      setHouseNumber("");
      setPaymentStatus("pending");
      setLeaseStart("");
    } catch (error) {
      console.error("Failed to register tenant:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Register a Tenant
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Add a tenant and their rental information.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Tenant name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            House number
          </label>
          <input
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            placeholder="e.g. House 12"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Payment status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(
                e.target.value as Tenant["paymentStatus"]
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Lease start date
          </label>
          <input
            type="date"
            value={leaseStart}
            onChange={(e) => setLeaseStart(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Registering..." : "Register Tenant"}
        </button>
      </div>
    </form>
  );
}
