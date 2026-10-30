import Toast from "react-native-toast-message";

/**
 * Thin wrapper mirroring react-hot-toast's API surface so the ~15 ported
 * `toast.success(...)` / `toast.error(...)` call sites need no edits.
 */
export const toast = {
  success: (message: string) =>
    Toast.show({ type: "success", text1: message, position: "top" }),
  error: (message: string) =>
    Toast.show({ type: "error", text1: message, position: "top" }),
};

export default toast;
