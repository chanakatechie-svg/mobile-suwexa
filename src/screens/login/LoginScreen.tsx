import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  completeProfile,
  patientRequestOtp,
  patientResendOtp,
  patientVerifyOtp,
  resetPatientOnboarding,
  selectAccount,
  setPatientLogin,
  setPatientOnboarding,
  setPatientSelectAccount,
  setPatientSelectClinic,
  tickOtpRetry,
  patientLogout,
} from "../../store/features/patientAuthSlice";
import type {
  SelectAccountLoginResult,
  VerifyOtpLoginResult,
  VerifyOtpRegisterResult,
  VerifyOtpSelectAccountResult,
  VerifyOtpSelectClinicResult,
} from "../../store/features/patientAuthSlice";
import { patientAuthApi } from "../../services/api/patientAuth.api";
import { usePortalLanguage } from "../../hooks/usePortalLanguage";
import { useClinicParam } from "../../hooks/useClinicParam";
import { useWallClockCountdown } from "../../hooks/useWallClockCountdown";
import { isValidE164, toE164 } from "../../utils/phone";
import toast from "../../utils/toast";
import type { Option } from "../../components/common/SelectModal";

import PhoneStep from "./steps/PhoneStep";
import { isValidLocalMobile } from "../../components/common/MaskedPhoneInput";
import OtpStep from "./steps/OtpStep";
import SelectAccountStep from "./steps/SelectAccountStep";
import SelectClinicStep from "./steps/SelectClinicStep";
import ProfileStep from "./steps/ProfileStep";

// Mirror the server-side TTLs (patient-auth.service.ts).
const OTP_EXPIRY_SECONDS = 300;
const ONBOARDING_TOKEN_EXPIRY = 900;
const PHONE_TOKEN_EXPIRY = 300;

type Step = "phone" | "otp" | "select-account" | "selectClinic" | "profile";

// Fallbacks if the public catalog endpoint is unreachable. The fields are
// creatable, so patients can still add their own.
const FALLBACK_PHX: Option[] = [
  "Hypertension", "Diabetes", "Asthma", "Heart Disease",
  "Thyroid Disorder", "High Cholesterol", "Kidney Disease", "Epilepsy",
].map((v) => ({ label: v, value: v }));

const FALLBACK_ALLERGIES: Option[] = [
  "Penicillin", "Sulfa drugs", "Aspirin", "NSAIDs",
  "Peanuts", "Latex", "Iodine",
].map((v) => ({ label: v, value: v }));

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { lang, setLang, t } = usePortalLanguage();

  const [step, setStep] = useState<Step>("phone");
  const [activePhone, setActivePhone] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState("");
  const [pickingClinicForNew, setPickingClinicForNew] = useState(false);

  const [phxOptions, setPhxOptions] = useState<Option[]>(FALLBACK_PHX);
  const [allergyOptions, setAllergyOptions] =
    useState<Option[]>(FALLBACK_ALLERGIES);

  const s = useAppSelector((st) => st.patientAuth);
  const selectedClinicId = s.selectedClinicId;

  // ?clinic=<code> from a clinic-issued deep link. When it resolves, the
  // clinic is fixed and the picker is skipped entirely.
  const clinicParam = useClinicParam();

  // Clinic-scoped catalog for the profile dropdowns. Silently keeps the
  // bundled fallbacks on failure so the dropdowns are never blank.
  useEffect(() => {
    if (!selectedClinicId) return;
    let cancelled = false;
    (async () => {
      try {
        const [phxRes, allergyRes] = await Promise.all([
          patientAuthApi.getMedicalCatalog("phx", selectedClinicId),
          patientAuthApi.getMedicalCatalog("allergy", selectedClinicId),
        ]);
        if (cancelled) return;
        const toOptions = (rows: { value: string; label: string }[]) =>
          rows.map((r) => ({ value: r.value, label: r.label }));
        const phx = toOptions(phxRes.data ?? []);
        const allergy = toOptions(allergyRes.data ?? []);
        if (phx.length) setPhxOptions(phx);
        if (allergy.length) setAllergyOptions(allergy);
      } catch {
        // keep fallbacks
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedClinicId]);

  const resetToPhone = useCallback(() => {
    dispatch(resetPatientOnboarding());
    setStep("phone");
    setActivePhone("");
    setOtpDigits("");
    setPickingClinicForNew(false);
    setPhoneDigits("");
    setPhoneError(null);
  }, [dispatch]);

  const { remaining: otpRemaining, formatted: otpFmt } = useWallClockCountdown({
    seconds: OTP_EXPIRY_SECONDS,
    active: step === "otp",
    onExpire: undefined,
  });

  const { formatted: phoneTokenFmt, remaining: phoneTokenRemaining } =
    useWallClockCountdown({
      seconds: PHONE_TOKEN_EXPIRY,
      active: step === "select-account" || step === "selectClinic",
      onExpire: useCallback(() => {
        toast.error(t.sessionExpired);
        resetToPhone();
      }, [t, resetToPhone]),
    });

  const { formatted: onboardingFmt } = useWallClockCountdown({
    seconds: ONBOARDING_TOKEN_EXPIRY,
    active: step === "profile",
    onExpire: useCallback(() => {
      toast.error(t.sessionExpired);
      dispatch(patientLogout());
      resetToPhone();
    }, [t, dispatch, resetToPhone]),
  });

  // Live tick for the rate-limit counters (recomputed from wall-clock
  // deadlines inside the reducer, so backgrounding stays correct).
  const rateLimitActive = !!s.requestRetryAfter || !!s.resendRetryAfter;
  useEffect(() => {
    if (!rateLimitActive) return;
    const id = setInterval(() => dispatch(tickOtpRetry()), 1000);
    return () => clearInterval(id);
  }, [rateLimitActive, dispatch]);

  // ── After OTP verify — route to the right next step ──────────────
  useEffect(() => {
    if (!s.verifyResult || step !== "otp") return;
    const r = s.verifyResult;

    if (r.nextAction === "LOGIN") {
      dispatch(setPatientLogin(r as VerifyOtpLoginResult));
      dispatch(resetPatientOnboarding());
      toast.success(t.welcomeBack((r as VerifyOtpLoginResult).name));
    } else if (r.nextAction === "SELECT_ACCOUNT") {
      dispatch(setPatientSelectAccount(r as VerifyOtpSelectAccountResult));
      setStep("select-account");
    } else if (r.nextAction === "SELECT_CLINIC") {
      dispatch(setPatientSelectClinic(r as VerifyOtpSelectClinicResult));
      setStep("selectClinic");
    } else {
      dispatch(setPatientOnboarding(r as VerifyOtpRegisterResult));
      setStep("profile");
    }
  }, [s.verifyResult, step, dispatch, t]);

  // ── Verify errors — lockout / no attempts / expiry all reset ─────
  useEffect(() => {
    if (!s.verifyError || step !== "otp") return;
    if (s.verifyRateLimited) {
      toast.error("Your OTP has been locked. Please request a new one.");
      resetToPhone();
      return;
    }
    if (s.verifyRemainingAttempts === 0) {
      toast.error("Too many wrong attempts. Please request a new OTP.");
      resetToPhone();
      return;
    }
    if (s.verifyRemainingAttempts == null && !s.verifyRateLimited) {
      toast.error("OTP expired. Please request a new one.");
      resetToPhone();
    }
  }, [
    s.verifyError,
    s.verifyRateLimited,
    s.verifyRemainingAttempts,
    step,
    resetToPhone,
  ]);

  // ── select-account errors ────────────────────────────────────────
  useEffect(() => {
    if (!s.selectAccountError) return;
    const m = s.selectAccountError.toLowerCase();
    if (m.includes("expired") || m.includes("invalid")) {
      toast.error(t.sessionExpired);
      resetToPhone();
    }
  }, [s.selectAccountError, resetToPhone, t]);

  // ── complete-profile errors ──────────────────────────────────────
  useEffect(() => {
    if (!s.completeError) return;
    const m = s.completeError.toLowerCase();
    if (m.includes("unauthorized") || m.includes("expired")) {
      toast.error(t.sessionExpired);
      dispatch(patientLogout());
      resetToPhone();
    } else if (m.includes("already completed")) {
      toast.error("Profile already completed. Please sign in.");
      dispatch(patientLogout());
      resetToPhone();
    }
  }, [s.completeError, dispatch, resetToPhone, t]);

  // ── Handlers ─────────────────────────────────────────────────────
  // Per the design spec: the error appears on blur/submit and clears as soon
  // as the number is valid — not on every keystroke.
  const handlePhoneChange = (digits: string) => {
    setPhoneDigits(digits);
    if (isValidLocalMobile(digits)) {
      setPhoneError(null);
      // No lookup: see phoneHint below.
    }
  };

  const handlePhoneBlur = () => {
    if (phoneDigits.length > 0 && !isValidLocalMobile(phoneDigits)) {
      setPhoneError(t.invalidPhone);
    }
  };

  const handleSendOtp = async () => {
    const e164 = toE164(phoneDigits);
    if (!isValidLocalMobile(phoneDigits) || !isValidE164(e164)) {
      setPhoneError(t.invalidPhone);
      return;
    }
    const res = await dispatch(patientRequestOtp(e164));
    if (patientRequestOtp.fulfilled.match(res)) {
      setActivePhone(e164);
      setOtpDigits("");
      setStep("otp");
      toast.success(t.otpSent);
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    if (otpDigits.length < 6) return;
    await dispatch(
      patientVerifyOtp({ phoneNumber: activePhone, otpCode: otpDigits }),
    );
  }, [dispatch, activePhone, otpDigits]);

  // Auto-submit once six digits are in.
  useEffect(() => {
    if (otpDigits.length === 6 && step === "otp" && !s.verifyLoading) {
      handleVerifyOtp();
    }
  }, [otpDigits, step, s.verifyLoading, handleVerifyOtp]);

  const handleResend = async () => {
    setOtpDigits("");
    const res = await dispatch(patientResendOtp(activePhone));
    if (patientResendOtp.fulfilled.match(res)) toast.success(t.otpResent);
  };

  const handleSelectAccount = async (patientId: string, clinicId?: string) => {
    if (!s.phoneToken) return;
    const res = await dispatch(
      selectAccount({ phoneToken: s.phoneToken, patientId, clinicId }),
    );
    if (selectAccount.fulfilled.match(res)) {
      const result = res.payload;
      if (result.nextAction === "LOGIN") {
        dispatch(setPatientLogin(result as unknown as VerifyOtpLoginResult));
        dispatch(resetPatientOnboarding());
        toast.success(t.welcomeBack((result as SelectAccountLoginResult).name));
      } else {
        dispatch(
          setPatientOnboarding(result as unknown as VerifyOtpRegisterResult),
        );
        setStep("profile");
      }
    }
  };

  const handleCreateNewAccount = () => {
    // The link decides it when present; a single active clinic is also
    // unambiguous. Otherwise show the picker.
    if (clinicParam.clinicId) {
      handleSelectAccount("NEW", clinicParam.clinicId);
    } else if (s.clinics.length === 1) {
      handleSelectAccount("NEW", s.clinics[0].id);
    } else {
      setPickingClinicForNew(true);
    }
  };

  // SELECT_CLINIC auto-selects when unambiguous. autoSelectedRef prevents a
  // double-dispatch loop — do not remove it.
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    if (step !== "selectClinic") {
      autoSelectedRef.current = false;
      return;
    }
    if (s.phoneToken && !s.selectAccountLoading && !autoSelectedRef.current) {
      const autoClinicId =
        clinicParam.clinicId ?? (s.clinics.length === 1 ? s.clinics[0].id : null);
      if (autoClinicId) {
        autoSelectedRef.current = true;
        handleSelectAccount("NEW", autoClinicId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, s.clinics, s.phoneToken, s.selectAccountLoading, clinicParam.clinicId]);

  const handleCompleteProfile = async (payload: Record<string, unknown>) => {
    if (!s.token) return;
    const res = await dispatch(completeProfile({ token: s.token, payload }));
    if (completeProfile.fulfilled.match(res)) {
      dispatch(resetPatientOnboarding());
      toast.success(t.welcomeNew(String(payload.name ?? "")));
    }
  };

  // None: saying whether a number has accounts before the OTP would tell anyone
  // who types it in that its owner is a patient.
  const phoneHint = null;

  // English / Sinhala. Not in the Figma design, but a working feature of the
  // app, so it stays — as a compact control on the sign-in brand row.
  const languageToggle = (
    <View className="flex-row overflow-hidden rounded-full border border-line bg-surface">
      {(["en", "si"] as const).map((l) => (
        <Pressable
          key={l}
          onPress={() => setLang(l)}
          accessibilityRole="button"
          accessibilityState={{ selected: lang === l }}
          className={`px-3 py-1.5 ${lang === l ? "bg-primary" : ""}`}
        >
          <Text
            className={`font-inter-medium text-[12px] ${
              lang === l ? "text-white" : "text-ink-muted"
            }`}
          >
            {l === "en" ? "EN" : "සිං"}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {step === "phone" && (
          <PhoneStep
            t={t}
            digits={phoneDigits}
            onChangeDigits={handlePhoneChange}
            onBlur={handlePhoneBlur}
            onSend={handleSendOtp}
            clinicName={clinicParam.locked ? clinicParam.name : null}
            clinicResolving={clinicParam.resolving}
            clinicError={clinicParam.error}
            languageToggle={languageToggle}
            hint={phoneHint}
            error={phoneError}
            checking={s.checkPhoneLoading}
            checkError={s.checkPhoneError}
            requestError={s.requestError}
            requestRetryAfter={s.requestRetryAfter}
            loading={s.requestLoading}
            canSend={isValidLocalMobile(phoneDigits)}
          />
        )}

        {step === "otp" && (
          <OtpStep
            t={t}
            phone={activePhone}
            otp={otpDigits}
            onChangeOtp={setOtpDigits}
            onVerify={handleVerifyOtp}
            onResend={handleResend}
            onChangePhone={resetToPhone}
            remaining={otpRemaining}
            formatted={otpFmt}
            verifyLoading={s.verifyLoading}
            verifyError={s.verifyError}
            remainingAttempts={s.verifyRemainingAttempts}
            resendLoading={s.resendLoading}
            resendError={s.resendError}
            resendRetryAfter={s.resendRetryAfter}
          />
        )}

        {step === "select-account" && (
          <SelectAccountStep
            t={t}
            accounts={s.accounts}
            clinics={s.clinics}
            canCreateNew={s.canCreateNew}
            pickingClinic={pickingClinicForNew}
            countdown={phoneTokenFmt}
            urgent={phoneTokenRemaining <= 60}
            loading={s.selectAccountLoading}
            error={s.selectAccountError}
            onSelect={(id) => handleSelectAccount(id)}
            onCreateNew={handleCreateNewAccount}
            onChooseClinic={(cid) => handleSelectAccount("NEW", cid)}
            onBackToAccounts={() => setPickingClinicForNew(false)}
            onUseDifferentPhone={resetToPhone}
          />
        )}

        {step === "selectClinic" && (
          <SelectClinicStep
            t={t}
            clinics={s.clinics}
            countdown={phoneTokenFmt}
            urgent={phoneTokenRemaining <= 60}
            loading={s.selectAccountLoading}
            error={s.selectAccountError}
            onChooseClinic={(cid) => handleSelectAccount("NEW", cid)}
            onUseDifferentPhone={resetToPhone}
          />
        )}

        {step === "profile" && (
          <ProfileStep
            t={t}
            countdown={onboardingFmt}
            phxOptions={phxOptions}
            allergyOptions={allergyOptions}
            loading={s.completeLoading}
            error={s.completeError}
            onSubmit={handleCompleteProfile}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
