export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      requested_role?: 'PATIENT' | 'CAREGIVER' | 'ADMIN';
    };
  }
}