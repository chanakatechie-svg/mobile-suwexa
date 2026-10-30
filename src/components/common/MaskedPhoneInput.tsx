import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import CheckPrimaryIcon from "../../../assets/icons/check-primary.svg";
import InfoMutedIcon from "../../../assets/icons/info-muted.svg";
import PhoneIcon from "../../../assets/icons/phone.svg";
import { FieldError } from "../ui/Blocks";

interface MaskedPhoneInputProps {
  /** Raw digits (max 10), e.g. "0771234567". */
  value: string;
  /** Receives raw digits, not the masked display string. */
  onChangeDigits: (digits: string) => void;
  label?: string;
  /** Helper line under the field ("We'll send a 6-digit code by SMS"). */
  helper?: string;
  error?: string | null;
  editable?: boolean;
  onBlur?: () => void;
  onSubmit?: () => void;
}

/** Format raw digits into "0XX XXX XXXX" — ported from the web component. */
function formatPhone(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

const stripMask = (value: string) => value.replace(/\D/g, "");

/** A complete Sri Lankan mobile number in local form: 07X XXX XXXX. */
export const isValidLocalMobile = (digits: string) => /^07\d{8}$/.test(digits);

/**
 * Input / Phone from the design — default, focused, error and valid states.
 * Sri Lanka mobile, local format, auto-formatted 0XX XXX XXXX; the screen
 * converts to +94 E.164 before sending.
 */
export default function MaskedPhoneInput({
  value,
  onChangeDigits,
  label = "Phone number",
  helper,
  error,
  editable = true,
  onBlur,
  onSubmit,
}: MaskedPhoneInputProps) {
  const [focused, setFocused] = useState(false);
  const digits = stripMask(value ?? "");
  const valid = isValidLocalMobile(digits);

  const handleChange = (text: string) => {
    let next = stripMask(text);
    // First digit must always be 0 (same rule as the web input).
    if (next.length > 0 && next[0] !== "0") {
      next = "0" + next.slice(0, 9);
    }
    onChangeDigits(next.slice(0, 10));
  };

  const border = error
    ? "border-[1.5px] border-danger"
    : focused
      ? "border-[1.5px] border-primary"
      : valid
        ? "border border-primary-line"
        : "border border-line";

  return (
    <View className="w-full gap-2">
      {label ? (
        <Text className="font-inter-medium text-[14px] leading-[20px] text-ink">
          {label}
        </Text>
      ) : null}

      <View
        className={`h-14 flex-row items-center gap-3 rounded-[14px] bg-surface px-4 ${border} ${
          editable ? "" : "opacity-60"
        }`}
      >
        <PhoneIcon />
        <TextInput
          value={formatPhone(digits)}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onSubmitEditing={onSubmit}
          placeholder="07X XXX XXXX"
          placeholderTextColor="#94a3b8"
          editable={editable}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={12} // "0XX XXX XXXX"
          accessibilityLabel={label}
          className="h-full flex-1 font-inter text-[15px] text-ink"
        />
        {valid && !error ? <CheckPrimaryIcon /> : null}
      </View>

      {error ? (
        <FieldError message={error} />
      ) : helper ? (
        <View className="flex-row items-center gap-1.5">
          <InfoMutedIcon />
          <Text className="flex-1 font-inter text-[13px] leading-[18px] text-ink-muted">
            {helper}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
