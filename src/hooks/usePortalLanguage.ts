import { useCallback } from "react";

import { PORTAL_STRINGS, type Lang, type PortalStrings } from "../i18n";
import { setLang as setLangAction } from "../store/features/uiSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

/**
 * Same signature as the web hook, so every ported call site works unchanged.
 *
 * Difference: the web version seeds useState synchronously from localStorage
 * and keeps per-component state. RN storage is async, so the language lives in
 * Redux (persisted to AsyncStorage) instead — genuinely shared across screens,
 * and PersistGate already blocks the first render, so there's no flash of
 * English before Sinhala rehydrates.
 */
export function usePortalLanguage(): {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: PortalStrings;
} {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.ui.lang);

  const setLang = useCallback(
    (l: Lang) => {
      dispatch(setLangAction(l));
    },
    [dispatch],
  );

  return { lang, setLang, t: PORTAL_STRINGS[lang] };
}
