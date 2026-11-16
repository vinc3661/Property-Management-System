export type TenantBulkRow = {
  name: string;
  houseNumber: string;
  leaseStart: string;
};

export const validateTenantRow = (tenant: TenantBulkRow): boolean => {
  return (
    tenant.name.trim().length > 0 &&
    tenant.houseNumber.trim().length > 0 &&
    tenant.leaseStart.trim().length > 0
  );
};