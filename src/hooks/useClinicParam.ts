import { useEffect, useState } from "react";
import * as Linking from "expo-linking";

import { patientAuthApi } from "../services/api/patientAuth.api";
import { isValidClinicCode } from "../utils/clinicLinks";

export interface ClinicParamState {
  code: string | null;
  clinicId: string | null;
  name: string | null;
  resolving: boolean;
  error: string | null;
  /** True once resolved — the clinic is fixed and the picker is skipped. */
  locked: boolean;
}

const EMPTY: ClinicParamState = {
  code: null,
  clinicId: null,
  name: null,
  resolving: false,
  error: null,
  locked: false,
};

/**
 * Reads ?clinic=<code> from the deep link that opened the app and resolves it
 * to the clinic's display name. Ported from
 * frontend-suwexa/src/hooks/useClinicParam.ts.
 *
 * `Linking.useURL()` covers BOTH entry paths — getInitialURL() for a cold
 * start and the "url" event for a warm one — so a link works whether the app
 * was running or killed.
 *
 * Every bad-link case degrades to a usable form rather than a dead end:
 *   absent      → nothing locked, normal clinic picker
 *   malformed   → error shown, picker still available
 *   unknown     → error shown, picker still available
 */
export function useClinicParam(): ClinicParamState {
  const url = Linking.useURL();
  const [state, setState] = useState<ClinicParamState>(EMPTY);

  useEffect(() => {
    const raw = url ? Linking.parse(url).queryParams?.clinic : null;
    const value = typeof raw === "string" ? raw : null;

    if (!value) {
      setState(EMPTY);
      return;
    }

    const code = value.trim().toLowerCase();
    if (!isValidClinicCode(code)) {
      setState({
        ...EMPTY,
        error:
          "This login link is not valid. Continue below or ask your clinic for a new link.",
      });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, code, resolving: true, error: null }));

    patientAuthApi
      .resolveClinic(code)
      .then(({ data }) => {
        if (cancelled) return;
        setState({
          code: data.code,
          clinicId: data.id,
          name: data.name,
          resolving: false,
          error: null,
          locked: true,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          ...EMPTY,
          error:
            "This clinic link is unknown or no longer active. Continue below or contact your clinic.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
