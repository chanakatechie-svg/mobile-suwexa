import type { ReactNode } from "react";
import { Text, View } from "react-native";

import Button from "../../../components/ui/Button";
import MaskedPhoneInput from "../../../components/common/MaskedPhoneInput";
import StepLayout from "../../../components/ui/StepLayout";
import { BrandHeader, ClinicChip, Notice } from "../../../components/ui/Blocks";
import { Body, Caption, Display } from "../../../components/ui/Typography";
import type { PortalStrings } from "../../../i18n";

interface Props {
  t: PortalStrings;
  digits: string;
  onChangeDigits: (d: string) => void;
  onBlur: () => void;
  onSend: () => void;
  /** Clinic fixed by the portal link, shown as the "Signing in to" chip. */
  clinicName: string | null;
  clinicResolving: boolean;
  clinicError: string | null;
  /** Language toggle, placed on the brand row. */
  languageToggle: ReactNode;
  hint: string | null;
  error: string | null;
  checking: boolean;
  checkError: string | null;
  requestError: string | null;
  requestRetryAfter: number | null;
  loading: boolean;
  canSend: boolean;
}

/** Design screens 01–04 · Sign in (default, typing, invalid, valid). */
export default function PhoneStep({
  t,
  digits,
  onChangeDigits,
  onBlur,
  onSend,
  clinicName,
  clinicResolving,
  clinicError,
  languageToggle,
  hint,
  error,
  checking,
  checkError,
  requestError,
  requestRetryAfter,
  loading,
  canSend,
}: Props) {
  return (
    <StepLayout
      footer={
        <>
          <Button
            text={requestRetryAfter ? t.retryIn(requestRetryAfter) : t.sendOtp}
            onPress={onSend}
            loading={loading}
            disabled={loading || !!requestRetryAfter || checking || !canSend}
          />
          <Caption className="text-center text-ink-subtle">{t.footer}</Caption>
        </>
      }
    >
      <BrandHeader name={t.appName} subtitle={t.portal} right={languageToggle} />

      <View className="gap-1.5">
        <Display>{t.signInTitle}</Display>
        <Body>{t.signInSubtitle}</Body>
      </View>

      {clinicResolving && <Caption>Verifying clinic link…</Caption>}
      {clinicName && <ClinicChip label={t.signingInTo} clinic={clinicName} />}
      {clinicError && <Notice>{clinicError}</Notice>}

      <View className="gap-3">
        <MaskedPhoneInput
          value={digits}
          onChangeDigits={onChangeDigits}
          onBlur={onBlur}
          onSubmit={canSend ? onSend : undefined}
          label={t.phoneLabel}
          helper={t.phoneHelper}
          error={error}
        />

        {checking && <Caption className="text-ink-subtle">{t.checking}</Caption>}
        {!checking && hint && <Caption>{hint}</Caption>}
        {checkError && (
          <Text className="font-inter text-[13px] text-danger">{checkError}</Text>
        )}
        {requestError && !requestRetryAfter && (
          <Text className="font-inter text-[13px] text-danger">
            {requestError}
          </Text>
        )}
        {requestRetryAfter ? (
          <Notice>{t.waitBeforeNewOtp(requestRetryAfter)}</Notice>
        ) : null}
      </View>
    </StepLayout>
  );
}
