// lib/api.js

const API_URL = process.env.NEXT_PUBLIC_API_WORKER_URL || '/api/gas-webhook';

/**
 * Obtiene los horarios disponibles para un servicio y fecha.
 * @param {Date} date - La fecha seleccionada.
 * @param {string|number} serviceId - El ID del servicio.
 * @returns {Promise<string[]>} - Horarios ocupados obtenidos desde GAS.
 */
export async function getAvailableSlots(date, serviceId) {
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const res = await fetch(`${API_URL}?date=${formattedDate}&serviceId=${serviceId}`);
  const contentType = res.headers.get('content-type') ?? '';
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = null;
    }
  }

  if (!res.ok || !data) {
    throw new Error(data?.error || extractErrorMessage(text) || 'Error obteniendo horarios disponibles desde el backend.');
  }

  return data.busy || [];
}

/**
 * Envía la solicitud de reserva al backend (proxy GAS).
 * @param {object} bookingData - Datos de la reserva.
 * @returns {Promise<object>} - Respuesta del servidor.
 */
export async function bookAppointment(bookingData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = null;
    }
  }

  if (!response.ok || data?.error || !data) {
    throw new Error(data?.error || extractErrorMessage(text) || 'Error al confirmar la cita en el backend.');
  }

  return data;
}

export async function getClientByEmail(email, signal) {
  const params = new URLSearchParams({ email });
  const response = await fetch(`${API_URL}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  if (response.status === 404) {
    return null;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = null;
    }
  }

  if (!response.ok || !data?.customer) {
    throw new Error(data?.error || extractErrorMessage(text) || 'Error al buscar datos del cliente.');
  }

  return data.customer;
}

function extractErrorMessage(rawText) {
  if (!rawText) return '';
  const trimmed = rawText.trim();
  if (!trimmed) return '';
  // Intenta leer un mensaje básico si llega HTML o texto plano.
  if (trimmed.startsWith('<')) {
    const match = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = match ? match[1] : trimmed;
    const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text || 'Respuesta HTML inesperada del servidor.';
  }
  return trimmed.slice(0, 200);
}
