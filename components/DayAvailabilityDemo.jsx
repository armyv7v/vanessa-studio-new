import { useEffect, useState } from "react";
import { fetchAvailability, createBooking } from "../lib/api";
export default function DayAvailabilityDemo({ date, serviceId = "1" }) {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetchAvailability({ date, serviceId, signal: ctrl.signal })
      .then(({ times }) => { setTimes(times); setErr(null); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [date, serviceId]);
  async function book(t) {
    try {
      const end = new Date(new Date(t).getTime() + 60 * 60000).toISOString(); // demo 60 min
      const res = await createBooking({
        date: t.slice(0,10), start: t, end,
        serviceId, name: "Demo", email: "cliente@example.com", phone: "+56912345678", notes: "Demo"
      });
      alert("Reserva creada: " + JSON.stringify(res));
    } catch (e) {
      alert("Error reserva: " + e.message);
    }
  }
  if (loading) return <p>Cargando…</p>;
  if (err) return <p style={{color:"crimson"}}>Error: {err}</p>;
  if (!times.length) return <p>No hay horarios disponibles para este día.</p>;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:8 }}>
      {times.map((t,i)=>(
        <button key={i} className="px-3 py-2 rounded-lg border" onClick={()=>book(t)}>
          {new Date(t).toLocaleString("es-CL", { dateStyle:"short", timeStyle:"short" })}
        </button>
      ))}
    </div>
  );
}
