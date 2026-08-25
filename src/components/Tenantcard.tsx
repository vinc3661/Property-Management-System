
import { useState } from "react";
import type { Tenant } from "../types/Tenant";

type TenantCardProps = {
  tenant: Tenant;
  onDelete: (id: string) => void;
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

  const [name, setName] = useState(tenant.name);
  const [houseNumber, setHouseNumber] = useState(tenant.houseNumber);
  const [paymentStatus, setPaymentStatus] =
    useState<Tenant["paymentStatus"]>(tenant.paymentStatus);
  const [leaseStart, setLeaseStart] = useState(tenant.leaseStart);

  const handleSave = async () => {
    try {
      await onUpdate(tenant.id, {
        name,
        houseNumber,
        paymentStatus,
        leaseStart,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update tenant:", error);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow">
        <h3 className="mb-4 text-xl font-bold text-gray-700">
          Edit Tenant
        </h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tenant name"
          className="mb-3 w-full rounded-lg border p-2"
        />

        <input
          type="text"
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          placeholder="House number"
          className="mb-3 w-full rounded-lg border p-2"
        />

        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(
              e.target.value as Tenant["paymentStatus"]
            )
          }
          className="mb-3 w-full rounded-lg border p-2"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <input
          type="date"
          value={leaseStart}
          onChange={(e) => setLeaseStart(e.target.value)}
          className="mb-4 w-full rounded-lg border p-2"
        />

        <button
          type="button"
          onClick={handleSave}
          className="mr-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-lg bg-gray-400 px-4 py-2 text-sm font-semibold text-white"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h3 className="text-2xl font-bold text-gray-600">
        {tenant.name}
      </h3>

      <p className="text-sm text-gray-600">
        House: {tenant.houseNumber}
      </p>

      <p className="text-sm text-gray-600">
        Payment: {tenant.paymentStatus}
      </p>

      <p className="text-sm text-gray-600">
        Lease start: {tenant.leaseStart}
      </p>

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="mt-4 mr-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => onDelete(tenant.id)}
        className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
      >
        Delete
      </button>
    </div>
  );
}

