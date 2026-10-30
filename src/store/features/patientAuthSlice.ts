import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { patientAuthApi } from "../../services/api/patientAuth.api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface CheckPhoneResult {
  exists: boolean;
  accountCount: number;
  isOnboarded: boolean;
  message: string;
}

export interface AccountPreview {
  patientId: string;
  patientCode: string;
  name: string | null;
  isOnboarded: boolean;
  clinicId: string;
  clinicName: string;
}

export interface ClinicPreview {
  id: string;
  name: string;
}

export interface VerifyOtpLoginResult {
  nextAction: "LOGIN";
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: 86400;
  patientId: string;
  patientCode: string;
  name: string;
  message: string;
}

export interface VerifyOtpRegisterResult {
  nextAction: "COMPLETE_PROFILE";
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: 900;
  patientId: string;
  isNewPatient: boolean;
  message: string;
}

export interface VerifyOtpSelectAccountResult {
  nextAction: "SELECT_ACCOUNT";
  phoneToken: string;
  expiresIn: 300;
  accounts: AccountPreview[];
  canCreateNew: boolean;
  clinics: ClinicPreview[];
  message: string;
}

export interface VerifyOtpSelectClinicResult {
  nextAction: "SELECT_CLINIC";
  phoneToken: string;
  expiresIn: 300;
  clinics: ClinicPreview[];
  message: string;
}

export type VerifyOtpResult =
  | VerifyOtpLoginResult
  | VerifyOtpRegisterResult
  | VerifyOtpSelectAccountResult
  | VerifyOtpSelectClinicResult;

/** One of the caller's accounts, as returned by GET /patient-auth/my-accounts. */
export interface MyAccount {
  patientId: string;
  patientCode: string;
  name: string | null;
  isOnboarded: boolean;
  clinicId: string;
  clinicName: string;
  /** True for the account the current session is scoped to. */
  isCurrent: boolean;
}

export interface SwitchAccountResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  patientId: string;
  patientCode: string;
  name: string;
  clinicId: string;
  clinicName: string;
  message: string;
}

export interface PatientProfile {
  id: string;
  patientCode: string;
  /** Clinic this account belongs to — a phone can hold accounts at several. */
  clinicName?: string;
  name: string;
  gender: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
  isOnboarded: boolean;
  dateOfBirth: string | null;
  weight: number | null;
  height: number | null;
  address: string | null;
  email: string | null;
  medicalHistory: string[];
  allergies: string[];
  procedures: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface CompleteProfileResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: 86400;
  patient: PatientProfile;
}

interface VerifyOtpError {
  message: string;
  remainingAttempts?: number;
  rateLimited?: boolean;
}

export interface SelectAccountLoginResult {
  nextAction: "LOGIN";
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: 86400;
  patientId: string;
  patientCode: string;
  name: string;
  message: string;
}

export interface SelectAccountRegisterResult {
  nextAction: "COMPLETE_PROFILE";
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: 900;
  patientId: string;
  isNewPatient: boolean;
  message: string;
}

export type SelectAccountResult =
  | SelectAccountLoginResult
  | SelectAccountRegisterResult;

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
interface PatientAuthState {
  // auth
  token: string | null;
  patientId: string | null;
  isAuthenticated: boolean;

  // check-phone
  checkPhoneLoading: boolean;
  checkPhoneResult: CheckPhoneResult | null;
  checkPhoneError: string | null;

  // request OTP
  requestLoading: boolean;
  requestError: string | null;
  requestRetryAfter: number | null;
  /**
   * Absolute wall-clock deadline (ms since epoch) for the request rate limit.
   * MOBILE-ONLY addition: the web version decrements requestRetryAfter by 1
   * per tick, but JS timers are suspended when an RN app is backgrounded, so
   * the counter would barely move while the server's limit actually lapses.
   * tickOtpRetry recomputes from this instead of subtracting.
   */
  requestRetryAt: number | null;

  // resend OTP
  resendLoading: boolean;
  resendError: string | null;
  resendRetryAfter: number | null;
  /** Wall-clock deadline for the resend rate limit — see requestRetryAt. */
  resendRetryAt: number | null;

  // verify OTP
  verifyLoading: boolean;
  verifyError: string | null;
  verifyResult: VerifyOtpResult | null;
  verifyRemainingAttempts: number | null;
  verifyRateLimited: boolean;

  // select account / select clinic
  phoneToken: string | null;
  accounts: AccountPreview[];
  canCreateNew: boolean;
  clinics: ClinicPreview[];
  selectedClinicId: string | null;
  selectAccountLoading: boolean;
  selectAccountError: string | null;

  // complete profile
  completeLoading: boolean;
  completeError: string | null;

  // profile
  profile: PatientProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // update profile
  updateLoading: boolean;
  updateError: string | null;

  // clinic / account switching (authenticated)
  myAccounts: MyAccount[];
  myAccountsLoading: boolean;
  switchLoading: boolean;
  switchError: string | null;
}

const initialState: PatientAuthState = {
  token: null,
  patientId: null,
  isAuthenticated: false,

  checkPhoneLoading: false,
  checkPhoneResult: null,
  checkPhoneError: null,

  requestLoading: false,
  requestError: null,
  requestRetryAfter: null,
  requestRetryAt: null,

  resendLoading: false,
  resendError: null,
  resendRetryAfter: null,
  resendRetryAt: null,

  verifyLoading: false,
  verifyError: null,
  verifyResult: null,
  verifyRemainingAttempts: null,
  verifyRateLimited: false,

  phoneToken: null,
  accounts: [],
  canCreateNew: false,
  clinics: [],
  selectedClinicId: null,
  selectAccountLoading: false,
  selectAccountError: null,

  completeLoading: false,
  completeError: null,

  profile: null,
  profileLoading: false,
  profileError: null,

  updateLoading: false,
  updateError: null,

  myAccounts: [],
  myAccountsLoading: false,
  switchLoading: false,
  switchError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper - extract error message from API response
// ─────────────────────────────────────────────────────────────────────────────
function extractMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: string | string[] } };
  };
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return msg || fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────────

/** Endpoint A - Check Phone */
export const checkPhone = createAsyncThunk(
  "patientAuth/checkPhone",
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const res = await patientAuthApi.checkPhone(phoneNumber);
      return res.data as CheckPhoneResult;
    } catch (error: unknown) {
      return rejectWithValue(
        extractMessage(error, "Failed to check phone number."),
      );
    }
  },
);

/** Endpoint B - Request OTP */
export const patientRequestOtp = createAsyncThunk(
  "patientAuth/requestOtp",
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const res = await patientAuthApi.requestOtp(phoneNumber);
      return res.data as { message: string; expiresInSeconds: number };
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string; retryAfterSeconds?: number };
        };
      };
      if (err.response?.status === 429) {
        return rejectWithValue({
          message:
            err.response.data?.message ||
            "Please wait before requesting a new OTP.",
          retryAfterSeconds: err.response.data?.retryAfterSeconds ?? 60,
        });
      }
      return rejectWithValue({
        message: extractMessage(error, "Failed to send OTP."),
        retryAfterSeconds: null,
      });
    }
  },
);

/** Endpoint C - Resend OTP */
export const patientResendOtp = createAsyncThunk(
  "patientAuth/resendOtp",
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const res = await patientAuthApi.resendOtp(phoneNumber);
      return res.data as { message: string; expiresInSeconds: number };
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string; retryAfterSeconds?: number };
        };
      };
      if (err.response?.status === 429) {
        return rejectWithValue({
          message:
            err.response.data?.message ||
            "Please wait before requesting a new OTP.",
          retryAfterSeconds: err.response.data?.retryAfterSeconds ?? 60,
        });
      }
      return rejectWithValue({
        message: extractMessage(error, "Failed to resend OTP."),
        retryAfterSeconds: null,
      });
    }
  },
);

/** Endpoint D - Verify OTP */
export const patientVerifyOtp = createAsyncThunk(
  "patientAuth/verifyOtp",
  async (
    { phoneNumber, otpCode }: { phoneNumber: string; otpCode: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await patientAuthApi.verifyOtp(phoneNumber, otpCode);
      return res.data as VerifyOtpResult;
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string; remainingAttempts?: number };
        };
      };
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 429) {
        return rejectWithValue({
          message:
            data?.message ||
            "Too many failed attempts. Please request a new OTP.",
          rateLimited: true,
        } as VerifyOtpError);
      }
      if (status === 401) {
        const match = data?.message?.match(/(\d+)\s+attempt/i);
        return rejectWithValue({
          message: data?.message || "Invalid OTP.",
          remainingAttempts: match
            ? parseInt(match[1], 10)
            : data?.remainingAttempts,
        } as VerifyOtpError);
      }
      return rejectWithValue({
        message:
          data?.message ||
          "OTP expired or not found. Please request a new one.",
      } as VerifyOtpError);
    }
  },
);

/** Select Account (after SELECT_ACCOUNT from verify) */
export const selectAccount = createAsyncThunk(
  "patientAuth/selectAccount",
  async (
    {
      phoneToken,
      patientId,
      clinicId,
    }: { phoneToken: string; patientId: string; clinicId?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await patientAuthApi.selectAccount(
        phoneToken,
        patientId,
        clinicId,
      );
      return res.data as SelectAccountResult;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (err.response?.status === 401) {
        return rejectWithValue({
          message:
            err.response.data?.message ||
            "Phone token expired or invalid. Please verify OTP again.",
          expired: true,
        });
      }
      return rejectWithValue({
        message: extractMessage(error, "Failed to select account."),
      });
    }
  },
);

/** Endpoint E - Complete Profile */
export const completeProfile = createAsyncThunk(
  "patientAuth/completeProfile",
  async (
    { token, payload }: { token: string; payload: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const res = await patientAuthApi.completeProfile(token, payload);
      return res.data as CompleteProfileResult;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string | string[] } };
      };
      const status = err.response?.status;
      const msg = extractMessage(error, "Failed to complete profile.");
      if (status === 401) {
        return rejectWithValue({ message: msg, expired: true });
      }
      if (status === 400 && msg.toLowerCase().includes("already completed")) {
        return rejectWithValue({ message: msg, alreadyCompleted: true });
      }
      return rejectWithValue({ message: msg });
    }
  },
);

/** Endpoint F - Get My Profile */
export const fetchPatientProfile = createAsyncThunk(
  "patientAuth/fetchProfile",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await patientAuthApi.getProfile(token);
      return res.data as PatientProfile;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        return rejectWithValue({ message: "Unauthorized", expired: true });
      }
      return rejectWithValue({
        message: extractMessage(error, "Failed to fetch profile."),
      });
    }
  },
);

/** Accounts on the caller's own phone, across clinics (authenticated). */
export const fetchMyAccounts = createAsyncThunk(
  "patientAuth/myAccounts",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await patientAuthApi.myAccounts(token);
      return (res.data as { accounts: MyAccount[] }).accounts;
    } catch (error: unknown) {
      return rejectWithValue({
        message: extractMessage(error, "Failed to load your accounts."),
      });
    }
  },
);

/** Re-scope the session to another account on the same phone (no OTP). */
export const switchAccount = createAsyncThunk(
  "patientAuth/switchAccount",
  async (
    { token, patientId }: { token: string; patientId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await patientAuthApi.switchAccount(token, patientId);
      return res.data as SwitchAccountResult;
    } catch (error: unknown) {
      return rejectWithValue({
        message: extractMessage(error, "Could not switch account."),
      });
    }
  },
);

/** Endpoint G - Update My Profile */
export const updatePatientProfile = createAsyncThunk(
  "patientAuth/updateProfile",
  async (
    { token, payload }: { token: string; payload: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const res = await patientAuthApi.updateProfile(token, payload);
      return res.data as PatientProfile;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        return rejectWithValue({ message: "Unauthorized", expired: true });
      }
      return rejectWithValue({
        message: extractMessage(error, "Failed to update profile."),
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const patientAuthSlice = createSlice({
  name: "patientAuth",
  initialState,
  reducers: {
    /** Clear all state - used on logout and session expiry */
    patientLogout: () => initialState,

    /** Reset only the onboarding flow state (phone/otp/verify/select-account) */
    resetPatientOnboarding: (state) => {
      state.checkPhoneResult = null;
      state.checkPhoneError = null;
      state.checkPhoneLoading = false;
      state.requestLoading = false;
      state.requestError = null;
      state.requestRetryAfter = null;
      state.requestRetryAt = null;
      state.resendLoading = false;
      state.resendError = null;
      state.resendRetryAfter = null;
      state.resendRetryAt = null;
      state.verifyLoading = false;
      state.verifyError = null;
      state.verifyResult = null;
      state.verifyRemainingAttempts = null;
      state.verifyRateLimited = false;
      state.phoneToken = null;
      state.accounts = [];
      state.canCreateNew = false;
      state.clinics = [];
      state.selectedClinicId = null;
      state.selectAccountLoading = false;
      state.selectAccountError = null;
      state.completeLoading = false;
      state.completeError = null;
    },

    /** Store phoneToken + accounts (+ active clinics) after SELECT_ACCOUNT from verify */
    setPatientSelectAccount: (
      state,
      action: PayloadAction<VerifyOtpSelectAccountResult>,
    ) => {
      state.phoneToken = action.payload.phoneToken;
      state.accounts = action.payload.accounts;
      state.canCreateNew = action.payload.canCreateNew;
      state.clinics = action.payload.clinics ?? [];
    },

    /** Store phoneToken + active clinics after SELECT_CLINIC from verify (no accounts yet) */
    setPatientSelectClinic: (
      state,
      action: PayloadAction<VerifyOtpSelectClinicResult>,
    ) => {
      state.phoneToken = action.payload.phoneToken;
      state.accounts = [];
      state.canCreateNew = true;
      state.clinics = action.payload.clinics ?? [];
    },

    /** Persist the clinic chosen for a new/selected account (used by medical-catalog) */
    setSelectedClinicId: (state, action: PayloadAction<string | null>) => {
      state.selectedClinicId = action.payload;
    },

    /** Store token after LOGIN path from verify OTP */
    setPatientLogin: (state, action: PayloadAction<VerifyOtpLoginResult>) => {
      state.token = action.payload.accessToken;
      state.patientId = action.payload.patientId;
      state.isAuthenticated = true;
    },

    /** Store onboarding token after COMPLETE_PROFILE path from verify OTP */
    setPatientOnboarding: (
      state,
      action: PayloadAction<VerifyOtpRegisterResult>,
    ) => {
      state.token = action.payload.accessToken;
      state.patientId = action.payload.patientId;
      state.isAuthenticated = false;
    },

    /**
     * Recompute the "wait before requesting a new OTP" counters from their
     * absolute deadlines. Cleared to null at 0 so the Send/Resend buttons
     * re-enable. Driven by a 1s interval AND an AppState "active" listener.
     *
     * MOBILE DIFFERENCE: the web version subtracts 1 per tick. That breaks on
     * mobile because JS timers are suspended/throttled while the app is
     * backgrounded — the button would stay disabled long after the server's
     * limit lapsed. Deriving from Date.now() stays correct across
     * backgrounding, Doze and device sleep.
     */
    tickOtpRetry: (state) => {
      const remaining = (deadline: number | null) =>
        deadline === null
          ? null
          : Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) || null;

      if (state.requestRetryAt !== null) {
        state.requestRetryAfter = remaining(state.requestRetryAt);
        if (state.requestRetryAfter === null) {
          state.requestRetryAt = null;
          state.requestError = null;
        }
      }
      if (state.resendRetryAt !== null) {
        state.resendRetryAfter = remaining(state.resendRetryAt);
        if (state.resendRetryAfter === null) {
          state.resendRetryAt = null;
          state.resendError = null;
        }
      }
    },

    /**
     * MOBILE-ONLY: restore the access token read from expo-secure-store at
     * boot. The token is NOT in the redux-persist whitelist (SecureStore has a
     * ~2048-byte per-value limit and `profile` can exceed it), so it is
     * rehydrated separately.
     *
     * The token is the source of truth: a null token forces isAuthenticated
     * false even if AsyncStorage rehydrated it as true (the OS can clear the
     * keychain independently), which prevents a cold-start logout loop.
     */
    restoreToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── check phone ────────────────────────────────────────────────
      .addCase(checkPhone.pending, (state) => {
        state.checkPhoneLoading = true;
        state.checkPhoneError = null;
      })
      .addCase(checkPhone.fulfilled, (state, action) => {
        state.checkPhoneLoading = false;
        state.checkPhoneResult = action.payload;
      })
      .addCase(checkPhone.rejected, (state, action) => {
        state.checkPhoneLoading = false;
        state.checkPhoneError = action.payload as string;
      })

      // ── request OTP ────────────────────────────────────────────────
      .addCase(patientRequestOtp.pending, (state) => {
        state.requestLoading = true;
        state.requestError = null;
        state.requestRetryAfter = null;
        state.requestRetryAt = null;
      })
      .addCase(patientRequestOtp.fulfilled, (state) => {
        state.requestLoading = false;
      })
      .addCase(patientRequestOtp.rejected, (state, action) => {
        state.requestLoading = false;
        const p = action.payload as {
          message: string;
          retryAfterSeconds: number | null;
        };
        state.requestError = p?.message ?? "Failed to send OTP.";
        state.requestRetryAfter = p?.retryAfterSeconds ?? null;
        state.requestRetryAt = p?.retryAfterSeconds
          ? Date.now() + p.retryAfterSeconds * 1000
          : null;
      })

      // ── resend OTP ─────────────────────────────────────────────────
      .addCase(patientResendOtp.pending, (state) => {
        state.resendLoading = true;
        state.resendError = null;
        state.resendRetryAfter = null;
        state.resendRetryAt = null;
      })
      .addCase(patientResendOtp.fulfilled, (state) => {
        state.resendLoading = false;
        // reset verify state for fresh OTP
        state.verifyError = null;
        state.verifyRemainingAttempts = null;
        state.verifyRateLimited = false;
        state.verifyResult = null;
      })
      .addCase(patientResendOtp.rejected, (state, action) => {
        state.resendLoading = false;
        const p = action.payload as {
          message: string;
          retryAfterSeconds: number | null;
        };
        state.resendError = p?.message ?? "Failed to resend OTP.";
        state.resendRetryAfter = p?.retryAfterSeconds ?? null;
        state.resendRetryAt = p?.retryAfterSeconds
          ? Date.now() + p.retryAfterSeconds * 1000
          : null;
      })

      // ── verify OTP ─────────────────────────────────────────────────
      .addCase(patientVerifyOtp.pending, (state) => {
        state.verifyLoading = true;
        state.verifyError = null;
        state.verifyRemainingAttempts = null;
        state.verifyRateLimited = false;
      })
      .addCase(patientVerifyOtp.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.verifyResult = action.payload;
      })
      .addCase(patientVerifyOtp.rejected, (state, action) => {
        state.verifyLoading = false;
        const p = action.payload as VerifyOtpError;
        state.verifyError = p?.message ?? "Verification failed.";
        state.verifyRemainingAttempts = p?.remainingAttempts ?? null;
        state.verifyRateLimited = p?.rateLimited ?? false;
      })

      // ── select account ────────────────────────────────────────────
      .addCase(selectAccount.pending, (state) => {
        state.selectAccountLoading = true;
        state.selectAccountError = null;
      })
      .addCase(selectAccount.fulfilled, (state, action) => {
        state.selectAccountLoading = false;
        // Persist the clinic this selection belongs to (needed for the
        // clinic-scoped medical catalog on the COMPLETE_PROFILE step).
        const { patientId: selectedPatientId, clinicId } = action.meta.arg;
        if (clinicId) {
          state.selectedClinicId = clinicId;
        } else {
          const acc = state.accounts.find(
            (a) => a.patientId === selectedPatientId,
          );
          if (acc?.clinicId) state.selectedClinicId = acc.clinicId;
        }
        // Clear phone token after successful selection
        state.phoneToken = null;
        state.accounts = [];
        state.canCreateNew = false;
        state.clinics = [];
        if (action.payload.nextAction === "LOGIN") {
          state.token = action.payload.accessToken;
          state.patientId = action.payload.patientId;
          state.isAuthenticated = true;
        } else {
          // COMPLETE_PROFILE - store onboarding token
          state.token = action.payload.accessToken;
          state.patientId = action.payload.patientId;
          state.isAuthenticated = false;
        }
      })
      .addCase(selectAccount.rejected, (state, action) => {
        state.selectAccountLoading = false;
        const p = action.payload as { message: string };
        state.selectAccountError = p?.message ?? "Failed to select account.";
      })

      // ── complete profile ───────────────────────────────────────────
      .addCase(completeProfile.pending, (state) => {
        state.completeLoading = true;
        state.completeError = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.completeLoading = false;
        // CRITICAL: replace onboarding token with full access token
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.profile = action.payload.patient;
        state.patientId = action.payload.patient.id;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.completeLoading = false;
        const p = action.payload as { message: string };
        state.completeError = p?.message ?? "Failed to complete profile.";
      })

      // ── fetch profile ──────────────────────────────────────────────
      .addCase(fetchPatientProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.profileLoading = false;
        const p = action.payload as { message: string };
        state.profileError = p?.message ?? "Failed to fetch profile.";
      })

      // ── my accounts (clinic switcher) ───────────────────────────────
      .addCase(fetchMyAccounts.pending, (state) => {
        state.myAccountsLoading = true;
      })
      .addCase(fetchMyAccounts.fulfilled, (state, action) => {
        state.myAccountsLoading = false;
        state.myAccounts = action.payload;
      })
      .addCase(fetchMyAccounts.rejected, (state) => {
        state.myAccountsLoading = false;
      })

      // ── switch account ─────────────────────────────────────────────
      .addCase(switchAccount.pending, (state) => {
        state.switchLoading = true;
        state.switchError = null;
      })
      .addCase(switchAccount.fulfilled, (state, action) => {
        state.switchLoading = false;
        // New token is scoped to the chosen clinic. Clear the stale profile so
        // the dashboard refetches for the new account rather than briefly
        // showing the previous clinic's data.
        state.token = action.payload.accessToken;
        state.patientId = action.payload.patientId;
        state.isAuthenticated = true;
        state.profile = null;
        state.myAccounts = [];
      })
      .addCase(switchAccount.rejected, (state, action) => {
        state.switchLoading = false;
        const p = action.payload as { message: string };
        state.switchError = p?.message ?? "Could not switch account.";
      })

      // ── update profile ─────────────────────────────────────────────
      .addCase(updatePatientProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.updateLoading = false;
        const p = action.payload as { message: string };
        state.updateError = p?.message ?? "Failed to update profile.";
      });
  },
});

export const {
  patientLogout,
  resetPatientOnboarding,
  restoreToken,
  setPatientLogin,
  setPatientOnboarding,
  setPatientSelectAccount,
  setPatientSelectClinic,
  setSelectedClinicId,
  tickOtpRetry,
} = patientAuthSlice.actions;
export default patientAuthSlice.reducer;
