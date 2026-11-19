
export type PropertyTenantImport = {
  houseNumber: string;
  rentAmount: number;
  tenantName: string;
  leaseStart: string;

  
  paymentStatus: "paid" | "pending" | "unpaid";

  
  amountPaid?: number;
  paymentDate?: string;
  rentMonth?: string;
};
