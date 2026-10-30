import { Pressable, Text, View } from "react-native";

import ClockMutedIcon from "../../../../assets/icons/clock-muted.svg";
import Button from "../../../components/ui/Button";
import OtpInput from "../../../components/common/OtpInput";
import StepLayout from "../../../components/ui/StepLayout";
import { BackButton, FieldError } from "../../../components/ui/Blocks";
import { Display } from "../../../components/ui/Typography";
import type { PortalStrings } from "../../../i18n";
import { maskPhone } from "../../../utils/phone";

interface Props {
  t: PortalStrings;
  phone: string;
  otp: string;
  onChangeOtp: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangePhone: () => void;
  remaining: number;
  formatted: string;
  verifyLoading: boolean;
  verifyError: string | null;
  remainingAttempts: number | null;
  resendLoading: boolean;
  resendError: string | null;
  resendRetryAfter: number | null;
}

/** Design screens 05–07 · Verify (enter code, verifying, incorrect code). */
export default function OtpStep({
  t,
  phone,
  otp,
  onChangeOtp,
  onVerify,
  onResend,
  onChangePhone,
  remaining,
  formatted,
  verifyLoading,
  verifyError,
  remainingAttempts,
  resendLoading,
  resendError,
  resendRetryAfter,
}: Props) {
  // A wrong code that still has attempts left — the boxes go red (screen 07).
  const wrongCode =
    !!verifyError && remainingAttempts != null && remainingAttempts > 0;

  // The masked number is bold inside the subtitle, wherever the language puts it.
  const masked = maskPhone(phone);
  const [before, after = ""] = t.verifySubtitle(masked).split(masked);
  // Non-breaking spaces keep the number on one line, as in the design.
  const maskedNoWrap = masked.replace(/ /g, " ");

  const resendBlocked = resendLoading || !!resendRetryAfter;

  return (
    <StepLayout
      footer={
        <View className="flex-row gap-3">
          <Button
            text={t.changePhone}
            onPress={onChangePhone}
            variant="outline"
            className="flex-1"
          />
          <Button
            text={t.verify}
            onPress={onVerify}
            loading={verifyLoading}
            loadingText={t.verifying}
            // Disabled after a wrong code until it is changed (design screen 07);
            // a corrected code auto-submits on its sixth digit anyway.
            disabled={
              otp.length < 6 || verifyLoading || remaining === 0 || wrongCode
            }
            className="flex-1"
          />
        </View>
      }
    >
      <BackButton onPress={onChangePhone} label={t.back} />

      <View className="gap-1.5">
        <Display>{t.verifyTitle}</Display>
        <Text className="font-inter text-[15px] leading-[22px] text-ink-muted">
          {before}
          <Text className="font-inter-semibold text-ink">{maskedNoWrap}</Text>
          {after}
        </Text>
      </View>

      <View className="gap-4">
        <OtpInput
          value={otp}
          onChange={onChangeOtp}
          disabled={verifyLoading}
          error={wrongCode && otp.length === 6}
          autoFocus
        />

        {wrongCode && <FieldError message={t.attemptsLeft(remainingAttempts!)} />}
        {resendError && !resendRetryAfter && <FieldError message={resendError} />}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <ClockMutedIcon />
            <Text
              className={`font-inter-medium text-[14px] leading-[20px] ${
                remaining === 0 ? "text-danger" : "text-ink-muted"
              }`}
            >
              {remaining === 0 ? t.otpExpired : t.expiresIn(formatted)}
            </Text>
          </View>
          <Pressable
            onPress={onResend}
            disabled={resendBlocked}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text
              className={`font-inter-semibold text-[14px] leading-[20px] ${
                resendBlocked ? "text-ink-subtle" : "text-primary"
              }`}
            >
              {resendLoading
                ? t.resending
                : resendRetryAfter
                  ? t.resendIn(resendRetryAfter)
                  : t.resendOtp}
            </Text>
          </Pressable>
        </View>
      </View>
    </StepLayout>
  );
}
