
import { useState } from "react";
import type { FormEvent } from "react";

import type { PropertyTenantImport } from "../types/propertyTenantImport";

type TenantBulkProps = {
  onImportPropertiesAndTenants: (
    records: PropertyTenantImport[]
  ) => Promise<void>;
};

export function TenantBulkForm({
  onImportPropertiesAndTenants,
}: TenantBulkProps) {
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<"paid" | "pending" | "unpaid">("pending");

  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [rentMonth, setRentMonth] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (
      paymentStatus === "paid" &&
      (!amountPaid || !paymentDate || !rentMonth)
    ) {
      setError("Paid tenants require payment amount, date and rent month.");
      return;
    }

    const record: PropertyTenantImport = {
      tenantName: name.trim(),
      houseNumber: houseNumber.trim(),
      rentAmount: Number(rentAmount),
      leaseStart,
      paymentStatus,
      ...(amountPaid
        ? {
            amountPaid: Number(amountPaid),
            paymentDate,
            rentMonth,
          }
        : {}),
    };

    try {
      setLoading(true);

      await onImportPropertiesAndTenants([record]);

      setName("");
      setHouseNumber("");
      setRentAmount("");
      setLeaseStart("");
      setPaymentStatus("pending");
      setAmountPaid("");
      setPaymentDate("");
      setRentMonth("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Import failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        Add Property and Tenant
      </h2>

      <input
        required
        value={houseNumber}
        onChange={(e) => setHouseNumber(e.target.value)}
        placeholder="House number"
      />

      <input
        required
        type="number"
        min="1"
        value={rentAmount}
        onChange={(e) => setRentAmount(e.target.value)}
        placeholder="Monthly rent"
      />

      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tenant name"
      />

      <label className="block">
        Lease start
        <input
          required
          type="date"
          value={leaseStart}
          onChange={(e) => setLeaseStart(e.target.value)}
        />
      </label>

      <label className="block">
        Payment status
        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(
              e.target.value as "paid" | "pending" | "unpaid"
            )
          }
        >
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </label>

      {paymentStatus === "paid" && (
        <>
          <input
            required
            type="number"
            min="0.01"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="Amount paid"
          />

          <label className="block">
            Payment date
            <input
              required
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </label>

          <label className="block">
            Rent month
            <input
              required
              type="month"
              value={rentMonth}
              onChange={(e) => setRentMonth(e.target.value)}
            />
          </label>
        </>
      )}

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Property and Tenant"}
      </button>
    </form>
  );
}
