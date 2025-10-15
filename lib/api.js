// lib/api.js (Archivo nuevo)

import { format } from 'date-fns';

const GAS_URL = process.env.NEXT_PUBLIC_GAS_WEBHOOK_URL;

/**
 * Obtiene los horarios disponibles para un servicio y fecha.
 * @param {Date} date - La fecha seleccionada.
 * @param {string|number} serviceId - El ID del servicio.
 * @param {'normal' | 'extra'} mode - El modo de horario.
 * @returns {Promise<string[]>} - Una promesa que resuelve a un array de horarios.
 */
export async function getAvailableSlots(date, serviceId, mode = 'normal') {
  if (!GAS_URL) {
    throw new Error("La URL del webhook no está configurada.");
  }

  const formattedDate = format(date, 'yyyy-MM-dd');
  const url = new URL(GAS_URL);
  url.searchParams.append('date', formattedDate);
  url.searchParams.append('serviceId', serviceId);
  if (mode === 'extra') {
    url.searchParams.append('mode', 'extra');
  }

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Error obteniendo horarios disponibles');
  }

  return data.availableSlots || data.times || [];
}

/**
 * Envía la solicitud para confirmar una cita.
 * @param {object} bookingData - Los datos de la reserva.
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta del servidor.
 */
export async function bookAppointment(bookingData) {
  if (!GAS_URL) {
    throw new Error("La URL del webhook no está configurada.");
  }

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error || 'Error al confirmar la cita');
  }

  return data;
}

/**
 * Busca los datos de un cliente por su email.
 * Usa la API route local que a su vez llama al backend.
 * @param {string} email - El email del cliente.
 * @returns {Promise<object|null>} - Los datos del cliente o null.
 */
export async function getClientByEmail(email) {
  if (!email || !email.includes('@')) {
    return null;
  }

  try {
    const res = await fetch(`/api/client?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data.client || null;
  } catch (error) {
    console.error("Error al autocompletar datos del cliente:", error);
    return null;
  }
}
