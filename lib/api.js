// lib/api.js

const API_URL = process.env.NEXT_PUBLIC_GAS_WEBHOOK_URL;

/**
 * Obtiene los horarios disponibles para un servicio y fecha desde el nuevo backend.
 * @param {Date} date - La fecha seleccionada.
 * @param {string|number} serviceId - El ID del servicio.
 * @returns {Promise<string[]>} - Una promesa que resuelve a un array de horarios.
 */
export async function getAvailableSlots(date, serviceId) {
  if (!API_URL) {
    throw new Error("La URL de la API no está configurada en las variables de entorno.");
  }

  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const url = new URL(`${API_URL}?date=${formattedDate}&serviceId=${serviceId}`);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Error obteniendo horarios disponibles desde el backend.');
  }

  return data.busy || []; // El backend ahora devuelve los slots ocupados
}

/**
 * Envía la solicitud para confirmar una cita al nuevo backend.
 * @param {object} bookingData - Los datos de la reserva.
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta del servidor.
 */
export async function bookAppointment(bookingData) {
  if (!API_URL) {
    throw new Error("La URL de la API no está configurada.");
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error(data.error || 'Error al confirmar la cita en el backend.');
  }

  return data;
}

// Ya no necesitamos getClientByEmail, el nuevo backend no tiene esa función por ahora.
