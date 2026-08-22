export interface Tenant {
                
  name: string;             
  houseNumber: string;      
  paymentStatus: 'paid' | 'pending' | 'unpaid'; 
  leaseStart: string;       
}