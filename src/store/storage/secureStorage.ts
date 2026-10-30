import * as SecureStore from "expo-secure-store";

/**
 * The patient access token is a 24h bearer credential, so it lives in the
 * device keychain/keystore rather than AsyncStorage (which is plaintext).
 *
 * It is deliberately NOT part of the redux-persist whitelist: SecureStore has
 * a ~2048-byte limit per value, and the persisted `profile` (medicalHistory,
 * allergies, procedures) can exceed that. Persisting the whole slice there
 * would be a latent, data-dependent crash. Instead the token is written by
 * secureTokenMiddleware and rehydrated at boot via restoreToken().
 */
const TOKEN_KEY = "patientToken";

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // A keychain write failure must not break the login flow — the in-memory
    // token still works for this session; the user just re-authenticates next
    // cold start.
  }
}

export async function loadToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore — nothing actionable if the keychain is unavailable
  }
}
