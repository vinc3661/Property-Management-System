import { useState } from "react";
import type { Property } from "../types/Property";

type PropertyFormProps = {
  onAddProperty: (newPropertyData: Omit<Property, "id">) => Promise<void>;
};

export function PropertyForm({ onAddProperty }: PropertyFormProps) {
  const [houseNumber, setHouseNumber] = useState<string>("");
  const [rentAmount, setRentAmount] = useState<number>(0);
  const [status, setStatus] = useState<"occupied" | "vacant">("vacant");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onAddProperty({
        houseNumber,
        rentAmount,
        status,
      });

      setHouseNumber("");
      setRentAmount(0);
      setStatus("vacant");
    } catch (error) {
      console.error("Failed to add property:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-5 shadow"
    >
      <h2 className="mb-4 text-xl font-bold text-gray-800">
        Add Property
      </h2>

      <input
        type="text"
        value={houseNumber}
        onChange={(e) => setHouseNumber(e.target.value)}
        placeholder="Enter house number"
        className="mb-3 w-full rounded-lg border p-2"
      />

      <input
        type="number"
        value={rentAmount}
        onChange={(e) => setRentAmount(Number(e.target.value))}
        placeholder="Enter rent amount"
        className="mb-3 w-full rounded-lg border p-2"
      />

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as "occupied" | "vacant")
        }
        className="mb-3 w-full rounded-lg border p-2"
      >
        <option value="vacant">Vacant</option>
        <option value="occupied">Occupied</option>
      </select>

      <button
        type="submit"
        className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Add Property
      </button>
    </form>
  );
}