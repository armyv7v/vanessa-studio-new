﻿﻿// pages/api/client.js
export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'El parametro email es requerido' });
  }

  const GAS_URL = process.env.NEXT_PUBLIC_GAS_WEBHOOK_URL;

  if (!GAS_URL) {
    return res.status(500).json({ error: 'La URL del script de Google no esta configurada.' });
  }

  try {
    const workerUrl = new URL(GAS_URL);
    workerUrl.searchParams.set('action', 'getClient');
    workerUrl.searchParams.set('email', email);

    const gasResponse = await fetch(workerUrl.toString());
    const data = await gasResponse.json();

    if (!gasResponse.ok) {
      throw new Error(data?.error || 'Error al contactar el servicio de Google.');
    }

    return res.status(200).json({ client: data.client || null });
  } catch (error) {
    console.error('Error en /api/client:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
