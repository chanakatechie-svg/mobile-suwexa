import { store } from "../store";
import { patientLogout } from "../store/features/patientAuthSlice";

/**
 * Called when an authenticated patient request 401s.
 *
 * Web sets window.location; RN has no URL, so we dispatch instead. With the
 * conditional navigator (RootNavigator renders Login vs Dashboard based on
 * isAuthenticated), flipping that flag swaps the stack automatically — and
 * because there's no URL involved, the redirect-loop the web version had to
 * guard against can't happen here.
 *
 * patientLogout() resets the slice; secureTokenMiddleware clears the token
 * from expo-secure-store in response to the same action.
 */
export default function handleAuthFailure(): void {
  store.dispatch(patientLogout());
}
