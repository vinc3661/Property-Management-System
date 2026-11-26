
import { useState } from "react";

import type { Property } from "../types/Property";
import type { Tenant } from "../types/Tenant";

type SearchPageProps = {
  properties: Property[];
  tenants: Tenant[];
  onOpenTenants: () => void;
  onOpenProperties: () => void;
};

export function SearchPage({
  properties,
  tenants,
  onOpenTenants,
  onOpenProperties,
}: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const query = searchTerm.trim().toLowerCase();

  const matchingTenants = tenants.filter((tenant) => {
    return (
      tenant.name.toLowerCase().includes(query) ||
      tenant.houseNumber.toLowerCase().includes(query)
    );
  });

  const matchingProperties = properties.filter((property) => {
    return (
      property.houseNumber.toLowerCase().includes(query) ||
      property.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Search your workspace
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Find tenants and properties by name, house number, or status.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search tenants or properties..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-green-500"
        />
      </div>

      {!query ? (
        <p className="text-sm text-gray-400">
          Start typing to search your tenants and properties.
        </p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">
              Tenants ({matchingTenants.length})
            </h3>

            {matchingTenants.length === 0 ? (
              <p className="text-sm text-gray-500">
                No matching tenants found.
              </p>
            ) : (
              matchingTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={onOpenTenants}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                >
                  <div>
                    <p className="font-medium text-white">
                      {tenant.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Tenant · House {tenant.houseNumber}
                    </p>
                  </div>

                  <span className="text-gray-500">→</span>
                </button>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">
              Properties ({matchingProperties.length})
            </h3>

            {matchingProperties.length === 0 ? (
              <p className="text-sm text-gray-500">
                No matching properties found.
              </p>
            ) : (
              matchingProperties.map((property) => (
                <button
                  key={property.id}
                  onClick={onOpenProperties}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                >
                  <div>
                    <p className="font-medium text-white">
                      House {property.houseNumber}
                    </p>
                    <p className="mt-1 text-sm capitalize text-gray-400">
                      Property · {property.status}
                    </p>
                  </div>

                  <span className="text-gray-500">→</span>
                </button>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}
