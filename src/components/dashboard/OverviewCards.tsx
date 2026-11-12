
import type { Property } from "../../types/Property";
import type { Tenant } from "../../types/Tenant";

type OverviewCardsProps = {
  properties: Property[];
  tenants: Tenant[];
};

export function OverviewCards({
  properties,
  tenants,
}: OverviewCardsProps) {
  const totalProperties = properties.length;

  const occupiedProperties = properties.filter(
    (property) => property.status === "occupied"
  ).length;

  const vacantProperties = properties.filter(
    (property) => property.status === "vacant"
  ).length;

  const totalTenants = tenants.length;

  const cards = [
    {
      title: "Total Properties",
      value: totalProperties,
      description: "Properties under management",
    },
    {
      title: "Occupied",
      value: occupiedProperties,
      description: "Currently occupied properties",
    },
    {
      title: "Vacant",
      value: vacantProperties,
      description: "Available properties",
    },
    {
      title: "Total Tenants",
      value: totalTenants,
      description: "Registered tenants",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">
            {card.title}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-gray-900">
            {card.value}
          </h3>

          <p className="mt-2 text-xs text-gray-400">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}