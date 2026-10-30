import { useRef, useState } from "react";
import { TextInput, View } from "react-native";

interface OtpInputProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Wrong code — every box red (design screen 07). */
  error?: boolean;
  /** Verified — every box green. */
  success?: boolean;
}

/**
 * 6-box OTP entry.
 *
 * Two RN-specific problems the web version doesn't have:
 *
 * 1. Backspace on an ALREADY-EMPTY box fires no onChangeText, so the web
 *    onKeyDown approach has no equivalent — onKeyPress handles it. That is
 *    reliable on iOS but inconsistent across Android keyboards (Gboard vs
 *    Samsung), so handleChange also treats a shrinking value as a delete.
 *
 * 2. OS autofill (textContentType/autoComplete below) can deliver all 6
 *    digits to box 0 in one onChangeText. The web guard was /^\d?$/ — a
 *    single char — which would silently drop an autofilled code, so
 *    multi-character input is spread across the boxes instead.
 */
export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  error = false,
  success = false,
}: OtpInputProps) {
  const refs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  /** OTP / Digit states from the design: error, success, active, filled, empty. */
  const boxStyle = (i: number) => {
    if (error) return "border-danger bg-danger-soft text-danger";
    if (success) return "border-primary bg-primary-soft text-primary";
    if (focusedIndex === i && !disabled) return "border-primary bg-surface text-ink";
    if (value[i]) return "border-ink-subtle bg-surface text-ink";
    return "border-line bg-surface text-ink";
  };

  const focus = (i: number) => {
    if (i >= 0 && i < length) refs.current[i]?.focus();
  };

  const handleChange = (index: number, text: string) => {
    const digits = text.replace(/\D/g, "");

    // Autofill / paste: one field receives the whole code.
    if (digits.length > 1) {
      const next = digits.slice(0, length);
      onChange(next);
      focus(Math.min(next.length, length - 1));
      return;
    }

    const chars = value.split("");
    if (digits.length === 0) {
      // Android fallback for delete when onKeyPress doesn't fire.
      chars[index] = "";
      onChange(chars.join("").replace(/\s/g, ""));
      return;
    }

    chars[index] = digits;
    const next = chars.join("").slice(0, length);
    onChange(next);
    if (index < length - 1) focus(index + 1);
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !value[index] && index > 0) {
      const chars = value.split("");
      chars[index - 1] = "";
      onChange(chars.join(""));
      focus(index - 1);
    }
  };

  return (
    <View className="flex-row justify-between">
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ""}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={(e) => handleKeyPress(i, e.nativeEvent.key)}
          editable={!disabled}
          autoFocus={autoFocus && i === 0}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex((f) => (f === i ? null : f))}
          accessibilityLabel={`Digit ${i + 1} of ${length}`}
          keyboardType="number-pad"
          selectTextOnFocus
          // Box 0 stays loose so OS autofill can dump the whole code into it.
          maxLength={i === 0 ? length : 1}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          className={`h-14 w-12 rounded-xl border-[1.5px] text-center font-inter-semibold text-[24px] ${boxStyle(
            i,
          )} ${disabled ? "opacity-60" : ""}`}
        />
      ))}
    </View>
  );
}
