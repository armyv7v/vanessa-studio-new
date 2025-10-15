﻿﻿// pages/api/test-config.js
export const runtime = 'nodejs';

export default function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Endpoint disponible solo en entornos de desarrollo.' });
  }

  const mask = (value) => (value ? 'configurada' : 'no configurada');

  return res.status(200).json({
    GOOGLE_SHEET_ID: mask(process.env.GOOGLE_SHEET_ID),
    GOOGLE_CLIENT_EMAIL: mask(process.env.GOOGLE_CLIENT_EMAIL),
    GOOGLE_PRIVATE_KEY: mask(process.env.GOOGLE_PRIVATE_KEY),
  });
}
