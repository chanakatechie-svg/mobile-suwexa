/**
 * Normalize a locally-typed Sri Lankan number to E.164.
 * Ported verbatim from frontend-suwexa/.../patient-portal/login/index.tsx.
 */
export function toE164(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d.startsWith("0") && d.length === 10 ? "+94" + d.slice(1) : "+" + d;
}

/** True when the value is a well-formed Sri Lankan mobile number in E.164. */
export const isValidE164 = (e164: string) => /^\+94[0-9]{9}$/.test(e164);

/** Mask for display on the OTP screen: +94 7XX XXX 1234 -> "+94 7X XXX 1234". */
export const maskPhone = (e164: string) =>
  e164.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2X XXX $4");
