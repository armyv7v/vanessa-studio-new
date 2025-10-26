// components/ConnectGoogleButton.js
import { useState } from 'react';

/**
 * Small helper that calls our `/api/auth-url` endpoint and redirects
 * the browser to Google's consent screen.
 */
export default function ConnectGoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth-url');
      if (!response.ok) {
        throw new Error('No se pudo obtener la URL de autenticación.');
      }

      const data = await response.json();
      if (!data?.url) {
        throw new Error('La respuesta no incluyó la URL de autenticación.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Error inesperado');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 transition"
      >
        {loading ? 'Abriendo Google...' : 'Conectar Google Calendar'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
