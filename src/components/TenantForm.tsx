import { useState } from "react";
import type { Tenant } from "../types/Tenant";

type TenantFormProps = {
  onAddTenant: (tenantData: Omit<Tenant, "id"|"landlordId">) => void;
};

export function TenantForm({ onAddTenant }: TenantFormProps) {
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<Tenant["paymentStatus"]>("pending");
  const [leaseStart, setLeaseStart] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddTenant({
      name,
      houseNumber,
      paymentStatus,
      leaseStart,
    });

    setName("");
    setHouseNumber("");
    setPaymentStatus("pending");
    setLeaseStart("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register Tenant</h2>

      <input
        type="text"
        placeholder="Tenant name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white tracking-wide text-gray-700 placeholder-gray-400 focus:outline-none focus:right-2 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
      />

      <input
        type="text"
        placeholder="House number"
        value={houseNumber}
        onChange={(e) => setHouseNumber(e.target.value)}
        className="bg-white tracking-wide text-gray-700 placeholder-gray-400 focus:outline-none focus:right-2 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
      />

      <select
        value={paymentStatus}
        onChange={(e) =>
          setPaymentStatus(e.target.value as Tenant["paymentStatus"])
        }
        className="bg-white tracking-wide text-gray-700 placeholder-gray-400 focus:outline-none focus:right-2 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>

      <input
        type="date"
        value={leaseStart}
        onChange={(e) => setLeaseStart(e.target.value)}
      />

      <button type="submit">Add Tenant</button>
    </form>
  );
};


