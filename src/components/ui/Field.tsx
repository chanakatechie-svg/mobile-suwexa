import { forwardRef, useState } from "react";
import { TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { FieldError, FieldLabel } from "./Blocks";

interface FieldProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

/**
 * Input / Text from the design: label (red asterisk when required), a 52-tall
 * field with 12 radius; green border while focused, red border and an inline
 * message on error.
 */
const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, error, required, className = "", multiline, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const border = error
    ? "border-[1.5px] border-danger bg-danger-soft"
    : focused
      ? "border-[1.5px] border-primary bg-surface"
      : "border border-line bg-surface";

  return (
    <View className="gap-2">
      {label ? <FieldLabel label={label} required={required} /> : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        accessibilityLabel={label}
        className={`w-full rounded-xl pl-4 pr-3.5 font-inter text-[15px] leading-[22px] text-ink ${
          multiline ? "min-h-[52px] py-3.5" : "h-[52px]"
        } ${border} ${className}`}
        {...inputProps}
      />
      {error ? <FieldError message={error} /> : null}
    </View>
  );
});

export default Field;
