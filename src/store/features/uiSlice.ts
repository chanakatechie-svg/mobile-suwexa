import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Lang = "en" | "si";

interface UiState {
  lang: Lang;
}

const initialState: UiState = {
  lang: "en",
};

/**
 * Portal language.
 *
 * On web this is per-component useState seeded synchronously from
 * localStorage (see frontend-suwexa/.../i18n/usePortalLanguage.ts) — login and
 * dashboard each hold their own copy and only agree because both read the same
 * key. RN has no synchronous storage, so it lives in Redux instead:
 *   - genuinely shared across screens (fixes the latent web inconsistency)
 *   - persisted via redux-persist, and PersistGate already blocks the first
 *     render, so there is no flash of English before Sinhala loads.
 */
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLang: (state, action: PayloadAction<Lang>) => {
      state.lang = action.payload;
    },
  },
});

export const { setLang } = uiSlice.actions;
export default uiSlice.reducer;
