import { Pressable, Text } from "react-native";

import ChevronDownIcon from "../../../assets/icons/chevron-down.svg";

/**
 * The tappable field of the design's Input / Select: 52 tall, 12 radius,
 * value (or grey placeholder) and a down chevron. Opens a picker on press.
 */
export default function SelectField({
  value,
  placeholder,
  onPress,
  error,
  className = "",
  accessibilityLabel,
}: {
  value?: string | null;
  placeholder: string;
  onPress: () => void;
  error?: boolean;
  className?: string;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? placeholder}
      className={`h-[52px] flex-row items-center gap-2.5 rounded-xl pl-4 pr-3.5 ${
        error
          ? "border-[1.5px] border-danger bg-danger-soft"
          : "border border-line bg-surface"
      } ${className}`}
    >
      <Text
        numberOfLines={1}
        className={`flex-1 font-inter text-[15px] leading-[22px] ${
          value ? "text-ink" : "text-ink-subtle"
        }`}
      >
        {value || placeholder}
      </Text>
      <ChevronDownIcon />
    </Pressable>
  );
}
