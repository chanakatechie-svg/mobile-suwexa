/**
 * Clinic login-code shape — must match the backend's CLINIC_CODE_REGEX
 * (see backend-suwexa/src/auth/dto/auth.dto.ts).
 *
 * Only the validator is ported: the web file's link *builders* use
 * window.location.origin and are staff-side.
 */
export const isValidClinicCode = (code: string): boolean =>
  /^[a-z0-9-]{2,40}$/.test(code);
