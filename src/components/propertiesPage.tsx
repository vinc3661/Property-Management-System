
import type { Property } from "../types/Property";

import { PropertyForm } from "./PropertyForm";
import { PropertyCard } from "./PropertyCard";

type PropertiesPageProps = {
  properties: Property[];

  onAddProperty: (
    newPropertyData: Omit<Property, "id" | "landlordId">
  ) => Promise<void>;

  onDeleteProperty: (propertyId: string) => Promise<void>;

  onUpdateProperty: (
    id: string,
    updates: Partial<Omit<Property, "id">>
  ) => Promise<void>;
};

export function PropertiesPage({
  properties,
  onAddProperty,
  onDeleteProperty,
  onUpdateProperty,
}: PropertiesPageProps) {
  return (
    <div className="space-y-8">

    
      <PropertyForm onAddProperty={onAddProperty} />

      
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Your Properties
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your rental units and their details.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {properties.length} Properties
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              No properties yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your first property using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={onDeleteProperty}
                onUpdate={onUpdateProperty}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
