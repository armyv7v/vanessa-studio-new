﻿﻿// pages/api/subscribe-push.js

export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GAS_URL = process.env.NEXT_PUBLIC_GAS_WEBHOOK_URL;
  if (!GAS_URL) {
    return res.status(500).json({ error: 'La URL del webhook no esta configurada.' });
  }

  try {
    const { subscription, email } = await req.json();

    const payload = {
      action: 'saveSubscription',
      subscription,
      email,
    };

    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error en /api/subscribe-push:', error);
    return res.status(500).json({ error: 'Error al guardar la suscripcion.' });
  }
}
