export const environment = {
  apiUrl: 'https://cff6b8.eu-central-1-shared-1.restheart.com',
  features: {
    emailRegistration: true,
    passwordReset: true,
    oauthLogin: true,
    oauthProviders: ['google'] as const,
    teamInvitations: true,
  },
};
