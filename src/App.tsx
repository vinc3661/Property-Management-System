
import { useEffect, useState } from "react";
import type { Tenant } from "./types/Tenant";
import { TenantForm } from "./components/TenantForm";
import { TenantCard } from "./components/Tenantcard";
import { addTenantToCloud,subscribeToTenants,deleteTenantFromCloud } from "./services/firebase";


function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(()=>{
const unsubscribe=subscribeToTenants((updatedTenants)=>{
setTenants(updatedTenants)
})

return unsubscribe;
  },[])
  const handleAddTenant = async (
    newTenantData: Omit<Tenant, "id">
  ) => {
    try {
      const newTenant = await addTenantToCloud(newTenantData);

      setTenants((prevTenants) => [
        ...prevTenants,
        newTenant,
      ]);
    } catch (error) {
      console.error("Failed to add tenant:", error);
    }
  };

  const handleDeleteTenant = async(id:string)=>{
try{
await deleteTenantFromCloud(id);
}catch(error){
  console.error("failed to delete tenant:",error)
}

}

  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">

        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Property Management System
          </h1>

          <p className="mt-1 text-center text-sm font-semibold text-gray-500">
            Track real-time tenant registration status
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">

          <div className="md:col-span-1">
            <TenantForm onAddTenant={handleAddTenant} />
          </div>

          <div className="md:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Active Residencies
            </h2>

            {tenants.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-white p-8 text-center font-medium text-gray-400">
                No tenants registered yet. Use the form to add one!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {tenants.map((tenant) => (
                  <TenantCard
                    key={tenant.id}
                    tenant={tenant}
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

