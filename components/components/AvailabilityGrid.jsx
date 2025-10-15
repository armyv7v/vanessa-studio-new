import { useEffect, useState } from 'react';

export default function AvailabilityGrid({ from, to }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({ from, to });
    fetch(`/api/availability?${params}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch((e) => setError(e.message));
  }, [from, to]);

  if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>;
  if (!data) return <p>Cargando disponibilidad…</p>;

  return (
    <div>
      <h3>Disponibilidad del {data.from} al {data.to}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {data.slots.map((s, i) => (
          <button
            key={i}
            disabled={!s.available}
            onClick={() => console.log('Elegiste slot', s)}
            style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd', opacity: s.available ? 1 : 0.4 }}
          >
            {new Date(s.start).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
          </button>
        ))}
      </div>
    </div>
  );
}
