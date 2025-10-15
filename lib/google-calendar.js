// lib/google-calendar.js
// Obtiene eventos (públicos) con API KEY para calcular "busy"

const CALENDAR_ID = process.env.NEXT_PUBLIC_GCAL_CALENDAR_ID;
const API_KEY = process.env.NEXT_PUBLIC_GCAL_API_KEY;

/**
 * Obtiene los eventos de un calendario público de Google y los devuelve en formato "busy".
 * Esta función AHORA SIEMPRE llama directamente a la API de Google.
 */
export async function listPublicEvents({ timeMin, timeMax }) {
  if (!CALENDAR_ID || !API_KEY) {
    throw new Error('Faltan las variables de entorno NEXT_PUBLIC_GCAL_CALENDAR_ID o NEXT_PUBLIC_GCAL_API_KEY');
  }

  const params = new URLSearchParams({
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '2500',
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params.toString()}`;
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.error?.message || `Error en la API de Google Calendar (${res.status})`;
    throw new Error(errorMessage);
  }
  
  const data = await res.json();

  // Convertimos la respuesta de Google a un formato simple de "busy" [{start, end}]
  const busy = (data.items || []).map(evt => ({
    start: evt.start?.dateTime || (evt.start?.date ? `${evt.start.date}T00:00:00Z` : null),
    end: evt.end?.dateTime || (evt.end?.date ? `${evt.end.date}T23:59:59Z` : null),
  })).filter(b => b.start && b.end);

  return { busy, raw: data };
}
