export interface Payment {
  id: string;
  tenantId: string;
  landlordId: string;
  houseNumber: string;
  amount: number;
  paymentDate: string;
  month: string;
  status: "confirmed" | "pending" | "rejected";
  createdAt: string;
}