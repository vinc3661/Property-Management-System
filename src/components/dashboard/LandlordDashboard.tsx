
import { useState } from "react";

import type { Property } from "../../types/Property";
import type { Tenant } from "../../types/Tenant";
import type { Payment } from "../../types/Payment";

import { TenantsPage } from "../tenantPage";
import { PropertiesPage } from "../propertiesPage";
import { PaymentsPage } from "../PaymentsPage";
import {CaretakersPage} from "../CaretakersPage";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { OverviewCards } from "./OverviewCards";

type LandlordDashboardProps = {
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
 role: "landlord" | "caretaker";
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

  onRecordPayment: (
    paymentData: Omit<Payment, "id" | "landlordId" | "createdAt">
  ) => Promise<void>;

  onUpdatePaymentStatus: (
    paymentId: string,
    status: Payment["status"]
  ) => Promise<void>;
};

export function LandlordDashboard({
  properties,
  tenants,
  payments,
  userName,
  onSignOut,
  onAddTenant,
  onDeleteTenant,
  onUpdateTenant,
  onAddProperty,
  onDeleteProperty,
  onUpdateProperty,
  onRecordPayment,
  onUpdatePaymentStatus,
  role,
  

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
    payments: {
      title: "Payments",
      description: "Record and manage tenant rent payments.",
    },
    caretakers: {
      title: "Caretakers",
      description: "Manage your property caretakers.",
    },
    
  };

  const currentPage = pageDetails[activePage];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onSignOut={onSignOut}
        role={role}
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
              payments={payments}
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

          {activePage === "tenants" && (
            <TenantsPage
              tenants={tenants}
              onAddTenant={onAddTenant}
              onDeleteTenant={onDeleteTenant}
              onUpdateTenant={onUpdateTenant}
            />
          )}

          {activePage === "payments" && (
            <PaymentsPage
              tenants={tenants}
              payments={payments}
              onRecordPayment={onRecordPayment}
              onUpdatePaymentStatus={onUpdatePaymentStatus}
            />
          )}

          {activePage === "caretakers" && (
            <CaretakersPage
            
            />
          )}

         
        </div>
      </main>
    </div>
  );
}
