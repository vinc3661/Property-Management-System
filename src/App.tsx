import {useState} from 'react';
import {Tenant} from './types/Tenant';
import {TenantForm} from './components/TenantForm';
import {TenantCard} from './components/Tenantcard';

function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const handleAddTenant = (newTenantData: Omit<Tenant, 'id'>) => {
    const freshTenant: Tenant = {
      ...newTenantData,
      id: crypto.randomUUID(),
    };
    setTenants((prevTenants) => [...prevTenants, freshTenant]);
  };


const handleDeleteTenant=(id:string)=>{
setTenants((prevTenants)=>prevTenants.filter(t=>t.id !==id));
};

return(
<div className='min-h-sreen bg-grey p-8'>
<div className='max-w-6xl max-Auto space-y-8'>
<header className='text-center md:text-left'>
<h1 className='text-3xl font-extraBold text-gray-900 traking-tight'>
  Property Management System
</h1>
<p className='text-semiBold text-center text-sm text-grey mt-1'>
  Trakck Real-time Tenant Registration status configurations
</p>
</header>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <TenantForm onAddTenant={handleAddTenant} />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Active Residencies</h2>
            
            {tenants.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed rounded-xl text-gray-400 font-medium">
                No tenants registered yet. Use the form to add one!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tenants.map((item) => (
                  <TenantCard 
                    key={item.id} 
                    tenant={item} 
                    onDelete={handleDeleteTenant} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

