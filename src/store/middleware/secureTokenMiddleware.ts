import type { Middleware } from "@reduxjs/toolkit";

import { clearToken, saveToken } from "../storage/secureStorage";
import {
  completeProfile,
  patientLogout,
  selectAccount,
  setPatientLogin,
  setPatientOnboarding,
  switchAccount,
} from "../features/patientAuthSlice";

/**
 * Mirrors state.patientAuth.token into expo-secure-store.
 *
 * Every action that can change the token is listed here, so the write lives in
 * exactly one place instead of being scattered through screens. Runs AFTER the
 * reducer so it reads the already-updated value.
 */
export const secureTokenMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    const type = (action as { type?: string })?.type;
    if (!type) return result;

    const writesToken =
      type === setPatientLogin.type ||
      type === setPatientOnboarding.type ||
      type === selectAccount.fulfilled.type ||
      type === completeProfile.fulfilled.type ||
      type === switchAccount.fulfilled.type;

    if (writesToken) {
      const token = (store.getState() as { patientAuth: { token: string | null } })
        .patientAuth.token;
      if (token) void saveToken(token);
      else void clearToken();
    } else if (type === patientLogout.type) {
      void clearToken();
    }

    return result;
  };
