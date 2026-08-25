import type { Tenant } from "../types/Tenant";

type TenantCardProps = {
  tenant: Tenant;
  onDelete: (id: string) => void;
};

export function TenantCard({ tenant, onDelete }: TenantCardProps) {
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
        onClick={() => onDelete(tenant.id)}
        className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"
      >
        Delete
      </button>
    </div>
  );
}