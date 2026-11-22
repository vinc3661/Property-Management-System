
import type { Tenant } from "../types/Tenant";
import type { Property } from "../types/Property";

import { TenantForm } from "./TenantForm";
import { TenantCard } from "./Tenantcard";

type TenantsPageProps = {
  tenants: Tenant[];
  properties: Property[];

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
  properties,
  onAddTenant,
  onDeleteTenant,
  onUpdateTenant,
}: TenantsPageProps) {
  return (
    <div className="space-y-8">
      <TenantForm
        properties={properties}
        onAddTenant={onAddTenant}
      />

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Your Tenants
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Manage tenant details and payment statuses.
            </p>
          </div>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400">
            {tenants.length} {tenants.length === 1 ? "Tenant" : "Tenants"}
          </span>
        </div>

        {tenants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-10 text-center">
            <h3 className="text-lg font-semibold text-white">
              No tenants yet
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
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
