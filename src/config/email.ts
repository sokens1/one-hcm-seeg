// Configuration centralisée pour les emails
export const EMAIL_CONFIG = {
  // Email de support principal (utilisé dans le chatbot)
  SUPPORT_EMAIL: 'support@seeg-talentsource.com',
  
  // Numéro de téléphone de support
  SUPPORT_PHONE: '+241 076402886',
  
  // Nom de l'entreprise
  COMPANY_NAME: 'SEEG',
  
  // Nom du service
  SERVICE_NAME: 'Recrutement',
  
  // URL de la plateforme
  PLATFORM_URL: 'https://www.seeg-talentsource.com/',
  // PLATFORM_URL: 'https://seeg-talentsource.com',
  
  // Configuration des templates d'email
  TEMPLATES: {
    APPLICATION_CONFIRMATION: {
      SUBJECT_PREFIX: 'Confirmation de candidature –',
      FROM_NAME: 'SEEG Recrutement',
    }
  },
  
  // Configuration Resend
  RESEND: {
    API_KEY: 're_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK',
    FROM_EMAIL: 'support@seeg-talentsource.com',
    DOMAIN: 'seeg-talentsource.com'
  }
} as const;

// Fonction utilitaire pour formater l'email d'expédition
export const getFromEmail = (): string => {
  return `${EMAIL_CONFIG.TEMPLATES.APPLICATION_CONFIRMATION.FROM_NAME} <${EMAIL_CONFIG.SUPPORT_EMAIL}>`;
};

// Fonction utilitaire pour formater le sujet de l'email
export const getEmailSubject = (jobTitle: string): string => {
  return `${EMAIL_CONFIG.TEMPLATES.APPLICATION_CONFIRMATION.SUBJECT_PREFIX} ${jobTitle}`;
};
