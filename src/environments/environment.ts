export const environment = {
  // Your free RESTHeart Cloud service, e.g.
  // 'https://<srvid>.eu-central-1-free-1.restheart.com'. Left empty on purpose:
  // a real id committed here is the id every clone of this starter would talk
  // to, and empty shows the "configure your service" screen instead.
  //
  // To keep your own edit out of `git status`:
  //   git update-index --assume-unchanged src/environments/environment.ts
  apiUrl: '',
  features: {
    emailRegistration: true,
    passwordReset: true,
    oauthLogin: true,
    oauthProviders: ['google'] as const,
    teamInvitations: true,
  },
};
