
import { useState } from "react";
import type { Tenant } from "../types/Tenant";

type TenantCardProps = {
  tenant: Tenant;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    updates: Partial<Omit<Tenant, "id">>
  ) => Promise<void>;
};

export function TenantCard({
  tenant,
  onDelete,
  onUpdate,
}: TenantCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState(tenant.name);
  const [houseNumber, setHouseNumber] = useState(tenant.houseNumber);
  const [paymentStatus, setPaymentStatus] =
    useState<Tenant["paymentStatus"]>(tenant.paymentStatus);
  const [leaseStart, setLeaseStart] = useState(tenant.leaseStart);

  const handleCancel = () => {
    setName(tenant.name);
    setHouseNumber(tenant.houseNumber);
    setPaymentStatus(tenant.paymentStatus);
    setLeaseStart(tenant.leaseStart);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !houseNumber.trim() || !leaseStart) {
      alert("Please complete all tenant details.");
      return;
    }

    setIsSaving(true);

    try {
      await onUpdate(tenant.id, {
        name: name.trim(),
        houseNumber: houseNumber.trim(),
        paymentStatus,
        leaseStart,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update tenant:", error);
      alert("Could not update tenant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${tenant.name}?`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await onDelete(tenant.id);
    } catch (error) {
      console.error("Failed to delete tenant:", error);
      alert("Could not delete tenant. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const paymentStyles = {
    paid: "bg-green-50 text-green-700",
    pending: "bg-amber-50 text-amber-700",
    unpaid: "bg-red-50 text-red-700",
  };

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Edit tenant
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Update this tenant's information.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tenant name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tenant name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              House number
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="e.g. House 01"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Payment status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value as Tenant["paymentStatus"]
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Lease start date
            </label>
            <input
              type="date"
              value={leaseStart}
              onChange={(e) => setLeaseStart(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {tenant.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            House {tenant.houseNumber}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            paymentStyles[tenant.paymentStatus]
          }`}
        >
          {tenant.paymentStatus}
        </span>
      </div>

      <div className="my-5 border-t border-gray-100" />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Lease start</span>
          <span className="font-medium text-gray-800">
            {tenant.leaseStart}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Payment status</span>
          <span className="font-medium capitalize text-gray-800">
            {tenant.paymentStatus}
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isDeleting}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
