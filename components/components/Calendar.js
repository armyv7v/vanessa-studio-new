import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

/**
 * Propiedades:
 *   - selectedDate  (Date | null) → fecha actualmente elegida
 *   - onSelect      (Date) => void → callback cuando el usuario escoge una fecha
 */
export default function Calendar({ selectedDate, onSelect }) {
  const today = new Date();

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        disabled={{ before: today }} // no permitir días pasados
        footer={selectedDate && <p className="mt-2">Día seleccionado: {selectedDate.toLocaleDateString()}</p>}
        className="react-day-picker"
        styles={{
          caption: "flex justify-center mb-4 font-medium text-primary-700",
          head_cell: "text-sm font-medium text-primary-500",
          // custom Tailwind CSS override
        }}
      />
    </div>
  );
}