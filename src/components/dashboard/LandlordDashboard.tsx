
import { useState } from "react";

import type { Property } from "../../types/Property";
import type { Tenant } from "../../types/Tenant";

import { PropertiesPage } from "../propertiesPage";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { OverviewCards } from "./OverviewCards";

type LandlordDashboardProps = {
  properties: Property[];
  tenants: Tenant[];
  userName: string;
  onSignOut: () => void;

  onAddTenant: (
    tenant: Omit<Tenant, "id" | "landlordId">
  ) => Promise<void>;

  onDeleteTenant: (tenantId: string) => Promise<void>;

  onUpdateTenant: (
    id: string,
    updates: Partial<Omit<Tenant, "id">>
  ) => Promise<void>;

  onAddProperty: (
    property: Omit<Property, "id" | "landlordId">
  ) => Promise<void>;

  onDeleteProperty: (propertyId: string) => Promise<void>;

  onUpdateProperty: (
    id: string,
    updates: Partial<Omit<Property, "id">>
  ) => Promise<void>;
};

export function LandlordDashboard({
  properties,
  tenants,
  userName,
  onSignOut,
  onAddTenant,
  onDeleteTenant,
  onUpdateTenant,
  onAddProperty,
  onDeleteProperty,
  onUpdateProperty,
}: LandlordDashboardProps) {
  const [activePage, setActivePage] = useState("overview");

  const pageDetails: Record<
    string,
    { title: string; description: string }
  > = {
    overview: {
      title: "Overview",
      description: "Here's what's happening with your properties.",
    },
    properties: {
      title: "Properties",
      description: "Manage your rental properties.",
    },
    tenants: {
      title: "Tenants",
      description: "Manage your registered tenants.",
    },
    caretakers: {
      title: "Caretakers",
      description: "Manage your property caretakers.",
    },
    maintenance: {
      title: "Maintenance",
      description: "Track and manage maintenance issues.",
    },
  };

  const currentPage = pageDetails[activePage];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onSignOut={onSignOut}
      />

      <main className="min-w-0 flex-1">
        <DashboardHeader
          title={currentPage.title}
          description={currentPage.description}
          userName={userName}
        />

        <div className="space-y-8 p-8">
          
          {activePage === "overview" && (
            <OverviewCards
              properties={properties}
              tenants={tenants}
            />
          )}

          
          {activePage === "properties" && (
            <PropertiesPage
              properties={properties}
              onAddProperty={onAddProperty}
              onDeleteProperty={onDeleteProperty}
              onUpdateProperty={onUpdateProperty}
            />
          )}

          
          {activePage !== "overview" &&
            activePage !== "properties" && (
              <div className="rounded-xl border border-gray-200 bg-white p-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentPage.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  This section is coming together. We'll implement its
                  functionality next.
                </p>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
