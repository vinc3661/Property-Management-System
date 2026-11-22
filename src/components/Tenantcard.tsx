
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
  const [error, setError] = useState("");

  const [name, setName] = useState(tenant.name);
  const [houseNumber, setHouseNumber] = useState(tenant.houseNumber);
  const [paymentStatus, setPaymentStatus] =
    useState<Tenant["paymentStatus"]>(tenant.paymentStatus);
  const [leaseStart, setLeaseStart] = useState(tenant.leaseStart);

  const handleEdit = () => {
    setName(tenant.name);
    setHouseNumber(tenant.houseNumber);
    setPaymentStatus(tenant.paymentStatus);
    setLeaseStart(tenant.leaseStart);
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(tenant.name);
    setHouseNumber(tenant.houseNumber);
    setPaymentStatus(tenant.paymentStatus);
    setLeaseStart(tenant.leaseStart);
    setError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setError("");

    if (!name.trim() || !houseNumber.trim() || !leaseStart) {
      setError("Please complete all tenant details.");
      return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);

      await onUpdate(tenant.id, {
        name: name.trim(),
        houseNumber: houseNumber.trim(),
        paymentStatus,
        leaseStart,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update tenant:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not update tenant. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${tenant.name}?`
    );

    if (!confirmed || isDeleting) return;

    setError("");

    try {
      setIsDeleting(true);
      await onDelete(tenant.id);
    } catch (error) {
      console.error("Failed to delete tenant:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not delete tenant. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const paymentStyles: Record<Tenant["paymentStatus"], string> = {
    paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    unpaid: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">
            Edit Tenant
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Update this tenant's information.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Tenant name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tenant name"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              House number
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="e.g. House 01"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
            />
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
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

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-xl border bg-white border-zinc-700 px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-900 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition duration-200 hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {tenant.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            House {tenant.houseNumber}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
            paymentStyles[tenant.paymentStatus]
          }`}
        >
          {tenant.paymentStatus}
        </span>
      </div>

      <div className="my-5 border-t border-zinc-800" />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Lease start</span>
          <span className="font-medium text-zinc-300">
            {tenant.leaseStart}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Payment status</span>
          <span className="font-medium capitalize text-zinc-300">
            {tenant.paymentStatus}
          </span>
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

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleEdit}
          disabled={isDeleting}
          className="flex-1 rounded-xl bg-white border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-900 disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
