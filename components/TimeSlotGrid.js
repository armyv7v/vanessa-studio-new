import React from "react";
import { format, addMinutes, isBefore, isAfter, parse } from "date-fns";

/**
 * Props:
 *   - date           (Date) → día seleccionado
 *   - service        (Object) → servicio (contiene duración)
 *   - availableSlots (Array<string>) → cada slot en formato "HH:mm"
 *   - selectedSlot   (string | null) → slot seleccionado
 *   - onSelectSlot   (string) => void → callback al elegir slot
 */
export default function TimeSlotGrid({
  date,
  service,
  availableSlots,
  selectedSlot,
  onSelectSlot,
}) {
  // Horario de apertura/cierre (puedes adaptarlo)
  const OPEN_HOUR = 9;   // 09:00
  const CLOSE_HOUR = 20; // 20:00

  // Generar la lista de slots en 30 min (solo para mostrar formato)
  const slots = availableSlots.map((time) => {
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h, m, 0, 0);
    const end = addMinutes(start, service.duration);
    // Verificar que termina antes del cierre
    const withinHours =
      h >= OPEN_HOUR && (h + Math.ceil(service.duration / 60)) <= CLOSE_HOUR;
    return { time, start, end, withinHours };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h4 className="mb-2 font-semibold text-primary-700">
        Horarios disponibles ({service.duration} min)
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {slots.map(({ time, withinHours }) => (
          <button
            key={time}
            disabled={!withinHours}
            className={`px-3 py-2 rounded-md border transition-colors 
              ${selectedSlot === time
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"}
              ${!withinHours ? "opacity-40 cursor-not-allowed" : ""}`}
            onClick={() => onSelectSlot(time)}
          >
            {time}
          </button>
        ))}
      </div>
      {selectedSlot && (
        <p className="mt-3 text-sm text-gray-600">
          Has seleccionado: <strong>{selectedSlot}</strong>
        </p>
      )}
    </div>
  );
}