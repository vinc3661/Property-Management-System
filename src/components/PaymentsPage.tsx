
import { useState } from "react";
import type { FormEvent } from "react";

import type { Tenant } from "../types/Tenant";
import type { Payment } from "../types/Payment";

type PaymentsPageProps = {
  tenants: Tenant[];
  payments: Payment[];

  onRecordPayment: (
    paymentData: Omit<Payment, "id" | "landlordId" | "createdAt">
  ) => Promise<void>;

  onUpdatePaymentStatus: (
    paymentId: string,
    status: Payment["status"]
  ) => Promise<void>;
};

export function PaymentsPage({
  tenants,
  payments,
  onRecordPayment,
  onUpdatePaymentStatus,
}: PaymentsPageProps) {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [rentMonth, setRentMonth] = useState(currentMonth);
  const [status, setStatus] = useState<Payment["status"]>("pending");

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
    confirmed: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="space-y-8">
      {/* Payment summary */}
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

      {/* Record payment form */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Record a Payment
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Record a full payment or an instalment from a tenant.
          </p>
        </div>

        {tenants.length === 0 ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            You need to register a tenant before recording a payment.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tenant
                </label>

                <select
                  value={tenantId}
                  onChange={(event) => setTenantId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Date
                </label>

                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rent Month
                </label>

                <input
                  type="month"
                  required
                  value={rentMonth}
                  onChange={(event) => setRentMonth(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as Payment["status"])
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="pending">Pending verification</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </form>
        )}
      </section>

      {/* Payment history */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Payment History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review transactions and verify pending payments.
          </p>
        </div>

        {sortedPayments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-gray-800">
              No payments recorded yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Recorded transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
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

              <tbody className="divide-y divide-gray-100">
                {sortedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {getTenantName(payment.tenantId)}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {payment.houseNumber}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {payment.paymentDate}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {payment.rentMonth}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[payment.status]}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {payment.status === "pending" ? (
                        <div className="flex items-center gap-3">
                          <button
                            disabled={updatingPaymentId === payment.id}
                            onClick={() =>
                              handleStatusUpdate(payment.id, "confirmed")
                            }
                            className="font-semibold text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                          >
                            Confirm
                          </button>

                          <button
                            disabled={updatingPaymentId === payment.id}
                            onClick={() =>
                              handleStatusUpdate(payment.id, "rejected")
                            }
                            className="font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}
