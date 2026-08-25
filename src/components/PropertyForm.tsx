import { useState } from "react";
import type { Property } from "../types/Property";

type PropertyFormProps = {
  onAddProperty: (propertyData: Omit<Property, "id">) => void;
};

export function PropertyForm({ onAddProperty }: PropertyFormProps) {
  const [houseNumber, setHouseNumber] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [status, setStatus] =
    useState<Property["status"]>("vacant");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddProperty({
      houseNumber,
      rentAmount: Number(rentAmount),
      status,
    });

    setHouseNumber("");
    setRentAmount("");
    setStatus("vacant");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter House number"
        onChange={(e) => setHouseNumber(e.target.value)}
        value={houseNumber}
      />
    </form>
  );
}