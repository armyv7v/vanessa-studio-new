// pages/api/slots.js
import { DateTime } from "luxon";

// --- Manejador Principal de la Ruta (formato estándar de Node.js para Next.js) ---
export default async function handler(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "El parámetro date es obligatorio (YYYY-MM-DD)." });
  }

  // Obtenemos las variables de entorno del proyecto de Cloudflare (disponibles en el servidor)
  const calendarId = process.env.NEXT_PUBLIC_GCAL_CALENDAR_ID;
  const apiKey = process.env.NEXT_PUBLIC_GCAL_API_KEY;
  const timezone = process.env.NEXT_PUBLIC_TZ ?? "UTC";

  if (!calendarId || !apiKey) {
    return res.status(500).json({ error: "Faltan configuraciones de Google Calendar en las variables de entorno del servidor." });
  }

  try {
    const range = buildCalendarRange(date, timezone);
    const requestUrl = buildGoogleCalendarUrl(calendarId, apiKey, range);

    // La API de Next.js en el servidor llama a la API de Google
    const gcResponse = await fetch(requestUrl.toString());
    const payload = await gcResponse.json();

    if (!gcResponse.ok) {
      const message = payload?.error?.message || "Error obteniendo eventos del calendario.";
      return res.status(gcResponse.status).json({ error: message });
    }

    const busy = (payload.items || [])
      .filter((event) => !event.start?.date) // Filtra eventos de todo el día
      .map((event) => ({
        start: event.start?.dateTime ?? null,
        end: event.end?.dateTime ?? null,
      }));

    // Se devuelven los horarios ocupados al navegador del cliente
    return res.status(200).json({ busy });

  } catch (error) {
    return res.status(500).json({ error: error?.message ?? "Error interno del servidor obteniendo los horarios." });
  }
}

// --- Funciones de Utilidad ---

function buildCalendarRange(date, timezone) {
  const start = DateTime.fromISO(`${date}T00:00:00`, { zone: timezone });
  if (!start.isValid) throw new Error("Fecha inválida");
  const end = start.endOf("day");
  return { timeMin: start.toUTC().toISO(), timeMax: end.toUTC().toISO() };
}

function buildGoogleCalendarUrl(calendarId, apiKey, range) {
  if (!range.timeMin || !range.timeMax) throw new Error("Rango de tiempo inválido");
  const params = new URLSearchParams({
    key: apiKey,
    timeMin: range.timeMin,
    timeMax: range.timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "2500",
  });
  const encodedCalendar = encodeURIComponent(calendarId);
  return new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodedCalendar}/events?${params.toString()}`);
}
