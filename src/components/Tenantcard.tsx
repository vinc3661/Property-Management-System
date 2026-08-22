import type { Tenant } from "../types/Tenant";

interface TenantCardProps {
  tenant: Tenant;
  onDelete: (id: string) => void;
}

export function TenantCard({ tenant, onDelete }: TenantCardProps) {
  return <div>Tenant Card</div>;
}