import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";

import AlertErrorIcon from "../../../assets/icons/alert-error.svg";
import BackIcon from "../../../assets/icons/back.svg";
import CheckBadgeIcon from "../../../assets/icons/check-badge.svg";
import CheckPrimaryIcon from "../../../assets/icons/check-primary.svg";
import ChevronRightIcon from "../../../assets/icons/chevron-right.svg";
import ClockWarningIcon from "../../../assets/icons/clock-warning.svg";
import HospitalIcon from "../../../assets/icons/hospital.svg";
import InfoPrimaryIcon from "../../../assets/icons/info-primary.svg";
import LogoIcon from "../../../assets/icons/logo.svg";
import { Caption, BodyStrong, Title } from "./Typography";

/** Brand row: green app icon + "Suwexa / Patient Portal" (sign-in screen). */
export function BrandHeader({
  name,
  subtitle,
  right,
}: {
  name: string;
  subtitle: string;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="h-12 w-12 items-center justify-center rounded-[14px] bg-brand"
        style={{
          shadowColor: "#4db04f",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <LogoIcon />
      </View>
      <View className="flex-1">
        <Title>{name}</Title>
        <Caption>{subtitle}</Caption>
      </View>
      {right}
    </View>
  );
}

/** Round 44px back button (verify screen). */
export function BackButton({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      className="h-11 w-11 items-center justify-center rounded-[22px] border border-line bg-surface"
    >
      <BackIcon />
    </Pressable>
  );
}

/** Notice — Warning (clock, amber) or Info (info, green). */
export function Notice({
  type = "warning",
  children,
}: {
  type?: "warning" | "info";
  children: ReactNode;
}) {
  const info = type === "info";
  return (
    <View
      className={`flex-row items-start gap-2.5 rounded-xl border px-3.5 py-3 ${
        info ? "border-primary-line bg-primary-soft" : "border-warning-line bg-warning-soft"
      }`}
    >
      <View className="pt-px">{info ? <InfoPrimaryIcon /> : <ClockWarningIcon />}</View>
      <Text
        className={`flex-1 font-inter-medium text-[14px] leading-[20px] ${
          info ? "text-primary" : "text-warning"
        }`}
      >
        {children}
      </Text>
    </View>
  );
}

/** "Signing in to <clinic>" — the clinic fixed by the portal link. */
export function ClinicChip({ label, clinic }: { label: string; clinic: string }) {
  return (
    <View className="flex-row items-center gap-3 rounded-[14px] border border-primary-line bg-primary-soft px-3.5 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-surface">
        <HospitalIcon />
      </View>
      <View className="flex-1">
        <Caption>{label}</Caption>
        <BodyStrong numberOfLines={1}>{clinic}</BodyStrong>
      </View>
    </View>
  );
}

/** Up to two initials for an avatar, e.g. "Chanaka Niroshan" → "CN". */
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

/** Account Card — avatar initials, name, meta line, chevron or a trailing tag. */
export function AccountCard({
  name,
  meta,
  onPress,
  disabled,
  trailing,
}: {
  name: string;
  meta: string;
  onPress: () => void;
  disabled?: boolean;
  /** Replaces the chevron (e.g. an "Incomplete" tag). */
  trailing?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className="flex-row items-center gap-3.5 rounded-2xl border border-line bg-surface py-3.5 pl-4 pr-3.5"
      style={{
        shadowColor: "#0f1729",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-3xl bg-primary-soft">
        <Text className="font-inter-semibold text-[15px] leading-[22px] text-primary">
          {initialsOf(name)}
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <BodyStrong numberOfLines={1}>{name}</BodyStrong>
        <Caption numberOfLines={1}>{meta}</Caption>
      </View>
      {trailing ?? <ChevronRightIcon />}
    </Pressable>
  );
}

/** Chip — selected (green, check) or unselected (white). */
export function Chip({
  label,
  selected,
  onPress,
  className = "",
}: {
  label: string;
  selected: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ selected }}
      className={`h-11 flex-row items-center justify-center gap-1.5 rounded-[22px] px-4 ${
        selected
          ? "border-[1.5px] border-primary bg-primary-soft"
          : "border border-line bg-surface"
      } ${className}`}
    >
      {selected && <CheckPrimaryIcon />}
      <Text
        className={`font-inter-medium text-[14px] leading-[20px] ${
          selected ? "text-primary" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Badge / Verified. */
export function BadgeVerified({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-1 self-start rounded-full bg-primary-soft py-1 pl-2 pr-2.5">
      <CheckBadgeIcon />
      <Text className="font-inter-semibold text-[13px] leading-[18px] text-primary">
        {label}
      </Text>
    </View>
  );
}

/** Inline field error: alert icon + red message. */
export function FieldError({ message }: { message: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <AlertErrorIcon />
      <Text className="flex-1 font-inter-medium text-[13px] leading-[18px] text-danger">
        {message}
      </Text>
    </View>
  );
}

/** Required-field label: "Gender *". */
export function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <View className="flex-row gap-0.5">
      <Text className="font-inter-medium text-[14px] leading-[20px] text-ink">
        {label}
      </Text>
      {required ? (
        <Text className="font-inter-medium text-[14px] leading-[20px] text-danger">
          *
        </Text>
      ) : null}
    </View>
  );
}
