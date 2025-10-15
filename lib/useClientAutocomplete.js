// hooks/useClientAutocomplete.js
import { useState, useCallback } from 'react';
import { getClientByEmail } from '../lib/api';

export function useClientAutocomplete(setClientInfo) {
  const [isFetching, setIsFetching] = useState(false);

  const handleEmailBlur = useCallback(async (e) => {
    const email = e.target.value;
    if (!email || !email.includes('@')) {
      return;
    }

    try {
      setIsFetching(true);
      const clientData = await getClientByEmail(email);

      if (clientData) {
        setClientInfo(prev => ({
          ...prev,
          name: clientData.name || prev.name,
          phone: clientData.phone || prev.phone,
        }));
      }
    } finally {
      setIsFetching(false);
    }
  }, [setClientInfo]);

  return { isFetchingClient: isFetching, handleEmailBlur };
}