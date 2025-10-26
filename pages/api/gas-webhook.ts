import type { NextApiRequest, NextApiResponse } from 'next';

const GAS_WEBHOOK_URL = process.env.GAS_WEBHOOK_URL;

const allowCors = (res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  allowCors(res);

  if (!GAS_WEBHOOK_URL) {
    res.status(500).json({ error: 'GAS_WEBHOOK_URL is not configured.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    let upstreamResponse: Response;

    if (req.method === 'GET') {
      const { date, serviceId, ...rest } = req.query;
      const url = new URL(GAS_WEBHOOK_URL);

      if (date) {
        url.searchParams.set('date', String(date));
      }
      if (serviceId) {
        url.searchParams.set('serviceId', String(serviceId));
      }

      Object.entries(rest).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((single) => url.searchParams.append(key, single));
        } else {
          url.searchParams.set(key, String(value));
        }
      });

      upstreamResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (req.method === 'POST') {
      upstreamResponse = await fetch(GAS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body ?? {}),
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const text = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get('content-type') ?? '';
    const status = upstreamResponse.status;

    if (contentType.includes('application/json')) {
      res.status(status).json(JSON.parse(text));
    } else {
      res.status(status).send(text);
    }
  } catch (error: any) {
    res.status(502).json({
      error: 'No se pudo contactar con Google Apps Script.',
      detail: error?.message || String(error),
    });
  }
}
