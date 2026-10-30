import PatientClient from "../PatientClient";

/**
 * Ported from frontend-suwexa/src/services/api/patientAuth.api.ts.
 *
 * One addition: `resolveClinic`. On web it lives on the *staff* APIClient
 * (via authApi), which drags in the whole refresh-token machinery for what is
 * a public endpoint. It's moved here so the mobile app only needs one client.
 * Note the code is a PATH param, not a query param — see
 * backend-suwexa/src/clinic/clinic.controller.ts `@Get("resolve/:code")`.
 */
export const patientAuthApi = {
  // Endpoint A - Check Phone
  checkPhone: (phoneNumber: string) =>
    PatientClient.post("/patient-auth/check-phone", { phoneNumber }),

  // Endpoint B - Request OTP
  requestOtp: (phoneNumber: string) =>
    PatientClient.post("/patient-auth/otp/request", { phoneNumber }),

  // Endpoint C - Resend OTP
  resendOtp: (phoneNumber: string) =>
    PatientClient.post("/patient-auth/otp/resend", { phoneNumber }),

  // Endpoint D - Verify OTP
  verifyOtp: (phoneNumber: string, otpCode: string) =>
    PatientClient.post("/patient-auth/otp/verify", { phoneNumber, otpCode }),

  // Endpoint - Select Account. Pass patientId "NEW" + a clinicId to create a
  // new account in the chosen clinic (shared DB — accounts span clinics).
  selectAccount: (phoneToken: string, patientId: string, clinicId?: string) =>
    PatientClient.post("/patient-auth/select-account", {
      phoneToken,
      patientId,
      ...(clinicId ? { clinicId } : {}),
    }),

  // Public - active PHx / Allergy catalog options for portal dropdowns,
  // scoped to the patient's clinic.
  getMedicalCatalog: (type: "phx" | "allergy", clinicId: string) =>
    PatientClient.get("/patient-auth/medical-catalog", {
      params: { type, clinicId },
    }),

  // Endpoint E - Complete Profile
  completeProfile: (token: string, payload: Record<string, unknown>) =>
    PatientClient.post("/patient-auth/profile/complete", payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Endpoint F - Get My Profile
  getProfile: (token: string) =>
    PatientClient.get("/patient-auth/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Endpoint G - Update My Profile
  updateProfile: (token: string, payload: Record<string, unknown>) =>
    PatientClient.put("/patient-auth/profile/me", payload, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Clinic switching — the phone is read from the JWT server-side, so these
  // list/switch only within the caller's own accounts. No second OTP needed.
  myAccounts: (token: string) =>
    PatientClient.get("/patient-auth/my-accounts", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  switchAccount: (token: string, patientId: string) =>
    PatientClient.post(
      "/patient-auth/switch-account",
      { patientId },
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  // Public — resolve a ?clinic= link code to the clinic's display name.
  // 404 means unknown/inactive code (the login link is unusable).
  resolveClinic: (code: string) =>
    PatientClient.get<{ id: string; code: string; name: string }>(
      `/clinics/resolve/${encodeURIComponent(code)}`,
    ),
};
