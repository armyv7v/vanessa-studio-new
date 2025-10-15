import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { generateTimeSlots } from '../lib/slots';

const OPEN_HOUR = 10;
const CLOSE_HOUR = 18;
const STEP_MINUTES = 30;
const SLOT_DURATION_MINUTES = 30;

const dateFromString = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function AvailabilityGrid({ from, to }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setError(null);
      setData(null);

      const startDate = dateFromString(from);
      const endDate = dateFromString(to);

      if (!startDate || !endDate) {
        setError('Fechas inválidas.');
        return;
      }

      if (endDate < startDate) {
        setError('El rango seleccionado es inválido.');
        return;
      }

      try {
        const days = [];
        for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays(cursor, 1)) {
          days.push(new Date(cursor));
        }

        const requests = days.map(async (day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const response = await fetch(`/api/slots?action=getBusySlots&date=${dateStr}&mode=normal`);
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload?.error || 'No fue posible obtener la disponibilidad.');
          }

          const busy = Array.isArray(payload?.busy) ? payload.busy : [];

          const slots = generateTimeSlots({
            date: dateStr,
            openHour: OPEN_HOUR,
            closeHour: CLOSE_HOUR,
            stepMinutes: STEP_MINUTES,
            durationMinutes: SLOT_DURATION_MINUTES,
            busy,
          }).map((slot) => ({ ...slot, date: dateStr }));

          return slots;
        });

        const resolved = await Promise.all(requests);
        if (cancelled) return;

        const flattened = resolved.flat();
        setData({ from, to, slots: flattened });
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Error desconocido');
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>;
  if (!data) return <p>Cargando disponibilidad...</p>;

  return (
    <div>
      <h3>Disponibilidad del {data.from} al {data.to}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {data.slots.map((slot, index) => (
          <button
            key={`${slot.start}-${index}`}
            disabled={!slot.available}
            onClick={() => console.log('Elegiste slot', slot)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd', opacity: slot.available ? 1 : 0.4 }}
          >
            {new Date(slot.start).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
          </button>
        ))}
      </div>
    </div>
  );
}