export interface Tenant {
    id:string;           
  name: string;             
  houseNumber: string;      
  paymentStatus: 'paid' | 'pending' | 'unpaid'; 
  leaseStart: string;       
}