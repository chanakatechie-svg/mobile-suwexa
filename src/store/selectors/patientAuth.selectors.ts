import type { RootState } from "..";

// ── auth ─────────────────────────────────────────────────────────────────────
export const selectPatientToken = (state: RootState) => state.patientAuth.token;
export const selectPatientId = (state: RootState) =>
  state.patientAuth.patientId;
export const selectIsPatientAuthenticated = (state: RootState) =>
  state.patientAuth.isAuthenticated;

// ── check-phone ──────────────────────────────────────────────────────────────
export const selectCheckPhoneLoading = (state: RootState) =>
  state.patientAuth.checkPhoneLoading;
export const selectCheckPhoneResult = (state: RootState) =>
  state.patientAuth.checkPhoneResult;
export const selectCheckPhoneError = (state: RootState) =>
  state.patientAuth.checkPhoneError;

// ── request OTP ──────────────────────────────────────────────────────────────
export const selectPatientOtpRequestLoading = (state: RootState) =>
  state.patientAuth.requestLoading;
export const selectPatientOtpRequestError = (state: RootState) =>
  state.patientAuth.requestError;
export const selectPatientOtpRequestRetryAfter = (state: RootState) =>
  state.patientAuth.requestRetryAfter;

// ── resend OTP ───────────────────────────────────────────────────────────────
export const selectPatientOtpResendLoading = (state: RootState) =>
  state.patientAuth.resendLoading;
export const selectPatientOtpResendError = (state: RootState) =>
  state.patientAuth.resendError;
export const selectPatientOtpResendRetryAfter = (state: RootState) =>
  state.patientAuth.resendRetryAfter;

// ── verify OTP ───────────────────────────────────────────────────────────────
export const selectPatientOtpVerifyLoading = (state: RootState) =>
  state.patientAuth.verifyLoading;
export const selectPatientOtpVerifyError = (state: RootState) =>
  state.patientAuth.verifyError;
export const selectPatientOtpVerifyResult = (state: RootState) =>
  state.patientAuth.verifyResult;
export const selectPatientOtpVerifyRemainingAttempts = (state: RootState) =>
  state.patientAuth.verifyRemainingAttempts;
export const selectPatientOtpVerifyRateLimited = (state: RootState) =>
  state.patientAuth.verifyRateLimited;

// ── select account ──────────────────────────────────────────────────────────
export const selectPhoneToken = (state: RootState) =>
  state.patientAuth.phoneToken;
export const selectAccounts = (state: RootState) => state.patientAuth.accounts;
export const selectCanCreateNew = (state: RootState) =>
  state.patientAuth.canCreateNew;
export const selectClinics = (state: RootState) => state.patientAuth.clinics;
export const selectSelectedClinicId = (state: RootState) =>
  state.patientAuth.selectedClinicId;
export const selectSelectAccountLoading = (state: RootState) =>
  state.patientAuth.selectAccountLoading;
export const selectSelectAccountError = (state: RootState) =>
  state.patientAuth.selectAccountError;

// ── complete profile ─────────────────────────────────────────────────────────
export const selectCompleteProfileLoading = (state: RootState) =>
  state.patientAuth.completeLoading;
export const selectCompleteProfileError = (state: RootState) =>
  state.patientAuth.completeError;

// ── profile ──────────────────────────────────────────────────────────────────
export const selectPatientProfile = (state: RootState) =>
  state.patientAuth.profile;
export const selectPatientProfileLoading = (state: RootState) =>
  state.patientAuth.profileLoading;
export const selectPatientProfileError = (state: RootState) =>
  state.patientAuth.profileError;

// ── update profile ───────────────────────────────────────────────────────────
export const selectPatientUpdateLoading = (state: RootState) =>
  state.patientAuth.updateLoading;
export const selectPatientUpdateError = (state: RootState) =>
  state.patientAuth.updateError;

// ── ui / language ────────────────────────────────────────────────────────────
export const selectLang = (state: RootState) => state.ui.lang;
