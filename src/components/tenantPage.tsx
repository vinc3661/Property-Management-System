import type { Tenant } from "../types/Tenant";

import { TenantForm } from "./TenantForm";
import { TenantCard } from "./Tenantcard";

type TenantsPageProps = {
  tenants: Tenant[];

  onAddTenant: (
    tenantData: Omit<Tenant, "id" | "landlordId">
  ) => Promise<void>;

  onDeleteTenant: (tenantId: string) => Promise<void>;

  onUpdateTenant: (
    id: string,
    updates: Partial<Omit<Tenant, "id">>
  ) => Promise<void>;
};

export function TenantsPage({
  tenants,
  onAddTenant,
  onDeleteTenant,
  onUpdateTenant,
}: TenantsPageProps) {
  return (
    <div className="space-y-8">
      <TenantForm onAddTenant={onAddTenant} />

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Your Tenants
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage tenant details and payment statuses.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {tenants.length} Tenants
          </span>
        </div>

        {tenants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              No tenants yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Register your first tenant using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onDelete={onDeleteTenant}
                onUpdate={onUpdateTenant}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}