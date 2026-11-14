
import type { Property } from "../../types/Property";
import type { Tenant } from "../../types/Tenant";
import type { Payment } from "../../types/Payment";

type OverviewCardsProps = {
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
};

type RingChartProps = {
  percentage: number;
  color: string;
  label: string;
  value: string;
};

function RingChart({
  percentage,
  color,
  label,
  value,
}: RingChartProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="10"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800">
            {percentage}%
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function OverviewCards({
  properties,
  tenants,
  payments,
}: OverviewCardsProps) {
  const totalProperties = properties.length;

  const occupiedProperties = properties.filter(
    (property) => property.status === "occupied"
  ).length;

  const vacantProperties = properties.filter(
    (property) => property.status === "vacant"
  ).length;

  const totalTenants = tenants.length;

  const paidTenants = tenants.filter(
    (tenant) => tenant.paymentStatus === "paid"
  ).length;

  const pendingTenants = tenants.filter(
    (tenant) => tenant.paymentStatus === "pending"
  ).length;

  const unpaidTenants = tenants.filter(
    (tenant) => tenant.paymentStatus === "unpaid"
  ).length;

  const occupancyRate =
    totalProperties === 0
      ? 0
      : Math.round((occupiedProperties / totalProperties) * 100);

  const paymentRate =
    totalTenants === 0
      ? 0
      : Math.round((paidTenants / totalTenants) * 100);

  const paymentStatuses = [
    {
      label: "Paid",
      count: paidTenants,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      label: "Pending",
      count: pendingTenants,
      color: "bg-amber-400",
      textColor: "text-amber-600",
    },
    {
      label: "Unpaid",
      count: unpaidTenants,
      color: "bg-rose-500",
      textColor: "text-rose-600",
    },
  ];

  
  const currentDate = new Date();

  const monthlyCollections = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (5 - index),
      1
    );

    const year = monthDate.getFullYear();
    const month = String(monthDate.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;

    const total = payments
      .filter((payment) => {
        return (
          payment.status === "confirmed" &&
          payment.paymentDate?.slice(0, 7) === monthKey
        );
      })
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      key: monthKey,
      label: monthDate.toLocaleDateString("en-KE", {
        month: "short",
      }),
      year,
      total,
    };
  });

  const highestCollection = Math.max(
    ...monthlyCollections.map((month) => month.total),
    0
  );

  const totalCollected = monthlyCollections.reduce(
    (sum, month) => sum + month.total,
    0
  );

  const currencyFormatter = new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  });

  const formatCurrency = (amount: number) =>
    `KSh ${currencyFormatter.format(amount)}`;

  return (
    <div className="space-y-8">
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Properties"
          value={totalProperties}
          description="Registered properties"
        />

        <StatCard
          label="Occupied Units"
          value={occupiedProperties}
          description={`${occupancyRate}% occupancy rate`}
          icon="🏠"
        />

        <StatCard
          label="Vacant Units"
          value={vacantProperties}
          description="Available properties"
        />

        <StatCard
          label="Total Tenants"
          value={totalTenants}
          description="Registered tenants"
          icon="👥"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Property Occupancy
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              How your properties are being utilized.
            </p>
          </div>

          <RingChart
            percentage={occupancyRate}
            color="#3B82F6"
            label="Occupancy rate"
            value={`${occupiedProperties} of ${totalProperties} occupied`}
          />

          <div className="mt-6 flex flex-wrap gap-5 border-t border-gray-100 pt-5">
            <Legend color="bg-blue-500" label="Occupied" />
            <Legend color="bg-gray-200" label="Vacant" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Tenant Payments
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Overview of tenant payment statuses.
            </p>
          </div>

          <RingChart
            percentage={paymentRate}
            color="#10B981"
            label="Paid tenants"
            value={`${paidTenants} of ${totalTenants} tenants`}
          />

          <div className="mt-6 flex flex-wrap gap-5 border-t border-gray-100 pt-5">
            <Legend color="bg-emerald-500" label="Paid" />
            <Legend color="bg-amber-400" label="Pending" />
            <Legend color="bg-rose-500" label="Unpaid" />
          </div>
        </div>
      </section>

      
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Monthly Rent Collection
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Confirmed payments received over the last six months.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">
              Total collected
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(totalCollected)}
            </p>
          </div>
        </div>

        {totalCollected === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-xl">📊</span>
            </div>

            <p className="font-semibold text-gray-800">
              No confirmed collections yet
            </p>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Once you record and confirm rent payments, your monthly
              collection trend will appear here.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
              <span>Collection amount</span>
              <span>{formatCurrency(highestCollection)} maximum</span>
            </div>

            <div className="flex h-56 items-end gap-3 border-b border-gray-100 pb-3 sm:gap-5">
              {monthlyCollections.map((month) => {
                const barHeight =
                  highestCollection === 0
                    ? 0
                    : (month.total / highestCollection) * 100;

                return (
                  <div
                    key={month.key}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 min-h-4 whitespace-nowrap text-center text-[10px] font-medium text-gray-500 sm:text-xs">
                      {month.total > 0
                        ? currencyFormatter.format(month.total)
                        : ""}
                    </span>

                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        title={`${month.label} ${month.year}: ${formatCurrency(month.total)}`}
                        className="w-full max-w-12 rounded-t-lg bg-blue-500 transition-all duration-700 hover:bg-blue-600"
                        style={{
                          height: `${barHeight}%`,
                          minHeight: month.total > 0 ? "5px" : "0px",
                        }}
                      />
                    </div>

                    <span className="mt-3 text-xs font-medium text-gray-500">
                      {month.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-7">
          <h3 className="text-lg font-bold text-gray-900">
            Payment Breakdown
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Number of tenants in each payment category.
          </p>
        </div>

        <div className="space-y-6">
          {paymentStatuses.map((status) => {
            const percentage =
              totalTenants === 0
                ? 0
                : (status.count / totalTenants) * 100;

            return (
              <div key={status.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {status.label}
                  </span>

                  <span className={`text-sm font-bold ${status.textColor}`}>
                    {status.count}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${status.color} transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
