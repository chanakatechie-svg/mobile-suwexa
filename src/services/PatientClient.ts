import Axios, { AxiosRequestConfig } from "axios";

/**
 * Patient-portal HTTP client. Ported from
 * frontend-suwexa/src/services/PatientClient.ts.
 *
 * Two deliberate differences from the web version:
 *  - a timeout (the web client has none; on flaky mobile data a request would
 *    otherwise hang forever and the spinner never clears)
 *  - the 401 handler dispatches patientLogout() instead of setting
 *    window.location, since RN has no URL to redirect to.
 *
 * Kept from the web version: NO request interceptor. Every authenticated call
 * passes its own Authorization header, with the token threaded explicitly from
 * Redux. That verbosity is load-bearing — the flow has three different token
 * types (phone / onboarding / access) and an interceptor would happily attach
 * an onboarding token to a profile/me call.
 */
const PatientClient = Axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// The patient portal authenticates via SMS OTP and has no refresh-token flow,
// so a 401 on an *authenticated* call means the session is gone -> re-login.
// The OTP login-flow endpoints (check-phone, otp/*, select-account,
// profile/complete) legitimately return 401 for bad input, so those errors
// must propagate to the calling screen instead of forcing a logout.
const PROTECTED_ENDPOINTS = ["/patient-auth/profile/me"];

const isProtectedEndpoint = (url?: string) =>
  !!url && PROTECTED_ENDPOINTS.some((endpoint) => url.includes(endpoint));

PatientClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest: AxiosRequestConfig | undefined = error.config;
    if (
      error.response?.status === 401 &&
      isProtectedEndpoint(originalRequest?.url)
    ) {
      // Lazy require breaks the cycle:
      // PatientClient -> handleAuthFailure -> store -> slice -> api -> PatientClient.
      // A static import here resolves to undefined at runtime under Metro.

      const handleAuthFailure =
        require("../utils/handleAuthFailure").default as () => void;
      handleAuthFailure();
    }
    return Promise.reject(error);
  },
);

export default PatientClient;
