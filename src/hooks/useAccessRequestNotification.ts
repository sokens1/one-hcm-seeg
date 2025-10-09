import { useCallback } from 'react';

interface AccessRequestData {
  userEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  matricule: string;
  dateOfBirth: string;
  sexe: string;
  adresse: string;
}

export function useAccessRequestNotification() {
  const sendAccessRequestNotification = useCallback(async (data: AccessRequestData): Promise<boolean> => {
    try {
      console.log('📧 Envoi des notifications de demande d\'accès...');
      
      const response = await fetch('/api/send-access-request-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur envoi emails:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('✅ Emails envoyés:', result);
      return true;
    } catch (error) {
      console.error('❌ Exception envoi emails:', error);
      return false;
    }
  }, []);

  return { sendAccessRequestNotification };
}
