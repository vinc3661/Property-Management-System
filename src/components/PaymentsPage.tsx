
import { useState } from "react";
import type { FormEvent } from "react";

import type { Tenant } from "../types/Tenant";
import type { Payment } from "../types/Payment";
import type { Property } from "../types/Property";

type PaymentsPageProps = {
  tenants: Tenant[];
  payments: Payment[];
  properties: Property[];

  onRecordPayment: (
    paymentData: Omit<Payment, "id" | "landlordId" | "createdAt">
  ) => Promise<void>;

  onUpdatePaymentStatus: (
    paymentId: string,
    status: Payment["status"]
  ) => Promise<void>;
};

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function PaymentsPage({
  tenants,
  payments,
  properties,
  onRecordPayment,
  onUpdatePaymentStatus,
}: PaymentsPageProps) {
  const today = getLocalDate();
  const currentMonth = today.slice(0, 7);

  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [rentMonth, setRentMonth] = useState(currentMonth);
  const [status, setStatus] = useState<Payment["status"]>("pending");
  const [selectedRentMonth, setSelectedRentMonth] = useState(currentMonth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currencyFormatter = new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  });

  const formatCurrency = (value: number) =>
    `KSh ${currencyFormatter.format(value)}`;

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() -
      new Date(a.paymentDate).getTime()
  );

  const confirmedPayments = payments.filter(
    (payment) => payment.status === "confirmed"
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending"
  );

  const totalCollected = confirmedPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const totalPending = pendingPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  
  const rentStatusRows = tenants.map((tenant) => {
    
    const property = properties.find(
      (item) => item.houseNumber === tenant.houseNumber
    );

    
    const rentDue = property?.rentAmount ?? null;

    
    const totalPaid = payments
      .filter(
        (payment) =>
          payment.tenantId === tenant.id &&
          payment.rentMonth === selectedRentMonth &&
          payment.status === "confirmed"
      )
      .reduce((total, payment) => total + payment.amount, 0);

    
    const remaining = rentDue === null
      ? null
      : Math.max(rentDue - totalPaid, 0);

    
    let rentStatus: "paid" | "partial" | "unpaid" | "rent-not-set";

    if (rentDue === null) {
      rentStatus = "rent-not-set";
    } else if (totalPaid >= rentDue) {
      rentStatus = "paid";
    } else if (totalPaid > 0) {
      rentStatus = "partial";
    } else {
      rentStatus = "unpaid";
    }

    return {
      tenant,
      rentDue,
      totalPaid,
      remaining,
      rentStatus,
    };
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const selectedTenant = tenants.find(
      (tenant) => tenant.id === tenantId
    );

    const numericAmount = Number(amount);

    if (!selectedTenant) {
      setError("Please select a valid tenant.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (!paymentDate || !rentMonth) {
      setError("Please provide both payment date and rent month.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onRecordPayment({
        tenantId: selectedTenant.id,
        houseNumber: selectedTenant.houseNumber,
        amount: numericAmount,
        paymentDate,
        rentMonth,
        status,
      });

      setSuccess("Payment recorded successfully.");
      setTenantId("");
      setAmount("");
      setPaymentDate(today);
      setRentMonth(currentMonth);
      setStatus("pending");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while recording the payment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (
    paymentId: string,
    newStatus: Payment["status"]
  ) => {
    if (updatingPaymentId) return;

    setError("");
    setSuccess("");
    setUpdatingPaymentId(paymentId);

    try {
      await onUpdatePaymentStatus(paymentId, newStatus);
      setSuccess(`Payment ${newStatus} successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update payment status."
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const getTenantName = (id: string) => {
    const tenant = tenants.find((item) => item.id === id);
    return tenant?.name ?? "Unknown tenant";
  };

  const statusStyles = {
    confirmed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    pending: "border-zinc-700 bg-zinc-800 text-zinc-300",
    rejected: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-5 sm:grid-cols-3">
        <SummaryCard
          label="Total Collected"
          value={formatCurrency(totalCollected)}
          description="Confirmed payments"
        />

        <SummaryCard
          label="Pending Payments"
          value={formatCurrency(totalPending)}
          description={`${pendingPayments.length} transactions awaiting confirmation`}
        />

        <SummaryCard
          label="Total Transactions"
          value={payments.length.toString()}
          description="All recorded payments"
        />
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">
            Record a Payment
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Record a full payment or an instalment from a tenant.
          </p>
        </div>

        {tenants.length === 0 ? (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
            You need to register a tenant before recording a payment.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Tenant
                </label>

                <select
                  value={tenantId}
                  onChange={(event) => setTenantId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} — House {tenant.houseNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Amount (KSh)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Payment Date
                </label>

                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Rent Month
                </label>

                <input
                  type="month"
                  required
                  value={rentMonth}
                  onChange={(event) => setRentMonth(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Payment Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as Payment["status"])
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="pending">Pending verification</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </form>
        )}
      </section>


      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Rent Status
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Track rent paid and outstanding balances for each rent month.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Rent Month
            </label>
            <input
              type="month"
              value={selectedRentMonth}
              onChange={(event) => setSelectedRentMonth(event.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {tenants.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-400">
            Register tenants to see their rent status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tenant</th>
                  <th className="px-6 py-4 font-semibold">House</th>
                  <th className="px-6 py-4 font-semibold">Rent Due</th>
                  <th className="px-6 py-4 font-semibold">Paid</th>
                  <th className="px-6 py-4 font-semibold">Remaining</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {rentStatusRows.map((row) => (
                  <tr key={row.tenant.id} className="transition hover:bg-zinc-900/70">
                    <td className="px-6 py-4 font-medium text-white">
                      {row.tenant.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {row.tenant.houseNumber}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {row.rentDue === null ? "—" : formatCurrency(row.rentDue)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {formatCurrency(row.totalPaid)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {row.remaining === null ? "—" : formatCurrency(row.remaining)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                          row.rentStatus === "paid"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : row.rentStatus === "partial"
                            ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                            : row.rentStatus === "unpaid"
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : "border-zinc-700 bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {row.rentStatus === "rent-not-set"
                          ? "Rent not set"
                          : row.rentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-white">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Review transactions and verify pending payments.
          </p>
        </div>

        {error && tenants.length === 0 && (
          <p className="m-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {sortedPayments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-white">
              No payments recorded yet
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Recorded transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tenant</th>
                  <th className="px-6 py-4 font-semibold">House</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Payment Date</th>
                  <th className="px-6 py-4 font-semibold">Rent Month</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {sortedPayments.map((payment) => (
                  <tr key={payment.id} className="transition hover:bg-zinc-900/70">
                    <td className="px-6 py-4 font-medium text-white">
                      {getTenantName(payment.tenantId)}
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      {payment.houseNumber}
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      {payment.paymentDate}
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      {payment.rentMonth}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[payment.status]}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {payment.status === "pending" ? (
                        <div className="flex items-center gap-3">
                          <button
                            disabled={updatingPaymentId !== null}
                            onClick={() =>
                              handleStatusUpdate(payment.id, "confirmed")
                            }
                            className="font-semibold text-emerald-400 transition hover:text-emerald-300 disabled:opacity-40"
                          >
                            {updatingPaymentId === payment.id ? "Updating..." : "Confirm"}
                          </button>

                          <button
                            disabled={updatingPaymentId !== null}
                            onClick={() =>
                              handleStatusUpdate(payment.id, "rejected")
                            }
                            className="font-semibold text-red-400 transition hover:text-red-300 disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          No action
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-700">
      <p className="text-sm font-medium text-zinc-400">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}