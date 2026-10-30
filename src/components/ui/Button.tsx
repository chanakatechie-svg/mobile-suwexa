import { ActivityIndicator, Pressable, Text } from "react-native";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps {
  text: string;
  onPress: () => void;
  /** "outline" is the design's Secondary button. */
  variant?: Variant;
  loading?: boolean;
  /** Label shown beside the spinner while loading, e.g. "Verifying…". */
  loadingText?: string;
  disabled?: boolean;
  /** Extra classes on the pressable (e.g. "flex-1"). */
  className?: string;
}

/**
 * The design's Button: 56 tall, 14 radius, Inter SemiBold 16.
 *
 * Disabled is its own look (grey fill, subtle label) rather than a faded
 * primary — the design uses it to say "not yet", per its note "Use Disabled
 * until the form is valid".
 */
export default function Button({
  text,
  onPress,
  variant = "primary",
  loading = false,
  loadingText,
  disabled = false,
  className = "",
}: ButtonProps) {
  const off = disabled && !loading;

  const box =
    variant === "outline"
      ? "border border-line bg-surface"
      : variant === "ghost"
        ? "bg-transparent"
        : off
          ? "bg-line"
          : "bg-primary";

  const label =
    variant === "outline"
      ? "text-ink"
      : variant === "ghost"
        ? "text-primary"
        : off
          ? "text-ink-subtle"
          : "text-white";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-[14px] px-4 ${box} ${
        variant === "outline" && disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading && (
        <ActivityIndicator
          color={variant === "primary" ? "#ffffff" : "#23824a"}
        />
      )}
      {(!loading || loadingText) && (
        <Text
          className={`font-inter-semibold text-[16px] leading-[24px] ${label}`}
        >
          {loading ? loadingText : text}
        </Text>
      )}
    </Pressable>
  );
}
