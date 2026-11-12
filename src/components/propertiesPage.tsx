
import type { Property } from "../types/Property";
import { PropertyForm } from "./PropertyForm";

type PropertiesPageProps = {
  properties: Property[];
  onAddProperty: (
    newPropertyData: Omit<Property, "id" | "landlordId">
  ) => Promise<void>;
};

export function PropertiesPage({
  properties,
  onAddProperty,
}: PropertiesPageProps) {
  return (
    <div className="space-y-8">
    
      <PropertyForm onAddProperty={onAddProperty} />

      
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Your Properties ({properties.length})
        </h2>

        {properties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-gray-500">
              You haven't added any properties yet.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Add your first property using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  House {property.houseNumber}
                </h3>

                <p className="mt-2 text-gray-600">
                  Rent: KSh {property.rentAmount.toLocaleString()}
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-sm ${
                    property.status === "occupied"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {property.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
