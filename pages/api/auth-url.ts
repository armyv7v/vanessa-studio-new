// pages/api/google/auth-url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';

const scopes = ['https://www.googleapis.com/auth/calendar'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  res.status(200).json({ url: authUrl });
}
