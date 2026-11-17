import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  addScreenshotListener,
  disableAppSwitcherProtectionAsync,
  enableAppSwitcherProtectionAsync,
  usePreventScreenCapture,
} from "expo-screen-capture";

import {
  referralApi,
  type MyReferralLetter,
  type ReferralLetter,
} from "../../services/api/referral.api";
import type { PortalStrings } from "../../i18n";
import Button from "../../components/ui/Button";
import { BodyStrong, Caption, Label } from "../../components/ui/Typography";
import toast from "../../utils/toast";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Colombo time, which is how the clinic dates everything. */
const colombo = (iso: string) =>
  new Date(new Date(iso).getTime() + 5.5 * 3_600_000);

const formatDate = (iso: string) => {
  const d = colombo(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const formatDateTime = (iso: string) => {
  const d = colombo(iso);
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(iso)}, ${h % 12 || 12}:${m} ${h < 12 ? "am" : "pm"}`;
};

/** "3d 4h 10m" — the same wording as the web portal. */
function timeLeft(expiresAt: string, now: number): string | null {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Mounted only while a protected letter is on screen. On Android this sets
 * FLAG_SECURE: screenshots and screen recordings come out black. iOS can't
 * stop a screenshot; it hides the letter in the app switcher and in screen
 * recordings, and says so if a screenshot is taken.
 */
function ScreenshotBlock({ t }: { t: PortalStrings }) {
  usePreventScreenCapture("referral-letter");
  // iPhone only. Android already blocks the capture itself, and its listener
  // would need a storage permission this app doesn't ask for.
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const sub = addScreenshotListener(() => toast.error(t.screenshotTaken));
    void enableAppSwitcherProtectionAsync().catch(() => {});
    return () => {
      sub.remove();
      void disableAppSwitcherProtectionAsync().catch(() => {});
    };
  }, [t]);
  return null;
}

/** The letter as the doctor sent it, laid out for a phone. */
function LetterSheet({
  letter,
  watermark,
}: {
  letter: ReferralLetter;
  watermark: string | null;
}) {
  const accent = letter.themeColor || "#1dbf73";
  return (
    <View className="overflow-hidden rounded-[16px] border border-line bg-white">
      <View
        className="px-5 pb-3 pt-5"
        style={{ borderTopWidth: 4, borderTopColor: accent }}
      >
        <Text className="font-inter-semibold text-[18px] text-ink">
          {letter.clinicName ?? ""}
        </Text>
        {letter.clinicAddress ? (
          <Caption>{letter.clinicAddress}</Caption>
        ) : null}
        {letter.clinicPhone ? <Caption>{letter.clinicPhone}</Caption> : null}
        {letter.clinicAdmin ? (
          <Caption>
            {letter.clinicAdmin.name}
            {letter.clinicAdmin.slmcNumber
              ? ` · SLMC ${letter.clinicAdmin.slmcNumber}`
              : ""}
          </Caption>
        ) : null}
      </View>
      <View className="border-t border-line px-5 py-4">
        <Caption>{formatDate(letter.issuedAt)}</Caption>
        <Text
          className="mt-3 font-inter text-[15px] leading-[23px] text-ink"
          // Long-press copy is off: the text isn't selectable.
          selectable={false}
        >
          {letter.body}
        </Text>
        <View className="mt-5 gap-0.5">
          <Label>{letter.doctorName}</Label>
          {letter.doctorQualification ? (
            <Caption>{letter.doctorQualification}</Caption>
          ) : null}
          {letter.doctorSlmcNumber ? (
            <Caption>SLMC {letter.doctorSlmcNumber}</Caption>
          ) : null}
        </View>
      </View>
      {/* Traces a photo of the screen back to who it was shown to. */}
      {watermark ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-around"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <Text
              key={i}
              className="font-inter-semibold text-[12px] text-ink"
              style={{ opacity: 0.08, transform: [{ rotate: "-25deg" }] }}
            >
              {watermark}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

interface Props {
  token: string;
  patientCode: string;
  t: PortalStrings;
  /** Bumped by pull-to-refresh on the dashboard. */
  reloadKey: number;
}

/**
 * The patient's referral letters, with how long each can still be opened and
 * a button to read it. Nothing is shown when there are none. Letters the
 * doctor sent with "Block screenshots" ticked open with capture blocked.
 */
export default function ReferralLetters({
  token,
  patientCode,
  t,
  reloadKey,
}: Props) {
  const [letters, setLetters] = useState<MyReferralLetter[] | null>(null);
  const [now, setNow] = useState(Date.now());
  const [viewing, setViewing] = useState<{
    id: string;
    letter: ReferralLetter | null;
    expiresAt: string | null;
    blockScreenshots: boolean;
    error: string | null;
    openedAt: string;
  } | null>(null);

  const load = useCallback(() => {
    referralApi
      .mine(token)
      .then(({ data }) => setLetters(data))
      .catch(() => setLetters([]));
  }, [token]);

  useEffect(load, [load, reloadKey]);

  // Repaint the countdowns each minute; they're computed from the expiry
  // itself, so a backgrounded app is right again as soon as it repaints.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const open = (l: MyReferralLetter) => {
    setViewing({
      id: l.id,
      letter: null,
      expiresAt: null,
      // Protected from the first frame, before the answer even arrives.
      blockScreenshots: l.blockScreenshots !== false,
      error: null,
      openedAt: new Date().toISOString(),
    });
    referralApi
      .open(token, l.id)
      .then(({ data }) =>
        setViewing((v) =>
          v?.id === l.id
            ? {
                ...v,
                letter: data.letter,
                expiresAt: data.expiresAt,
                blockScreenshots: data.blockScreenshots !== false,
              }
            : v,
        ),
      )
      .catch((err: { response?: { status?: number } }) => {
        const gone = [404, 410].includes(err?.response?.status ?? 0);
        setViewing((v) =>
          v?.id === l.id
            ? { ...v, error: gone ? t.letterUnavailable : t.letterLoadFailed }
            : v,
        );
        if (gone) load();
      });
  };

  const live = (letters ?? []).filter((l) => timeLeft(l.expiresAt, now));
  if (live.length === 0) return null;

  return (
    <View className="gap-3 rounded-[20px] border border-line bg-surface p-5">
      <View className="flex-row items-center gap-2">
        <BodyStrong>{t.referralLetters}</BodyStrong>
        <View className="rounded-full bg-primary-soft px-2 py-0.5">
          <Text className="font-inter-semibold text-[11px] text-primary">
            {live.length}
          </Text>
        </View>
      </View>
      <Caption>{t.referralLettersHint}</Caption>

      {live.map((l) => {
        const left = timeLeft(l.expiresAt, now)!;
        const soon = new Date(l.expiresAt).getTime() - now < 86_400_000;
        return (
          <View
            key={l.id}
            className="gap-3 rounded-[14px] border border-line p-4"
          >
            <View className="gap-0.5">
              <Label numberOfLines={1}>
                {t.letterFrom(l.doctorName || l.clinicName || "")}
              </Label>
              <Caption numberOfLines={1}>
                {[l.clinicName, t.issuedOn(formatDate(l.issuedAt))]
                  .filter(Boolean)
                  .join(" · ")}
              </Caption>
              <View
                className={`mt-1 self-start rounded-full px-2 py-0.5 ${
                  soon ? "bg-amber-100" : "bg-primary-soft"
                }`}
              >
                <Text
                  className={`font-inter-semibold text-[11px] ${
                    soon ? "text-amber-800" : "text-primary"
                  }`}
                >
                  {t.expiresInTime(left)}
                </Text>
              </View>
            </View>
            <Button text={t.viewLetter} onPress={() => open(l)} />
          </View>
        );
      })}

      <Modal
        visible={!!viewing}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setViewing(null)}
      >
        {viewing?.blockScreenshots ? <ScreenshotBlock t={t} /> : null}
        <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
          <View className="flex-row items-center justify-between border-b border-line bg-surface px-5 pb-3 pt-2">
            <BodyStrong>{t.referralLetters}</BodyStrong>
            <Pressable
              onPress={() => setViewing(null)}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text className="font-inter-semibold text-[14px] text-primary">
                {t.close}
              </Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="gap-3 p-5">
            {viewing?.error ? (
              <Caption className="py-8 text-center">{viewing.error}</Caption>
            ) : viewing?.letter ? (
              <>
                <LetterSheet
                  letter={viewing.letter}
                  watermark={
                    viewing.blockScreenshots
                      ? `CONFIDENTIAL · ${patientCode} · ${formatDateTime(viewing.openedAt)}`
                      : null
                  }
                />
                {viewing.blockScreenshots ? (
                  <Caption className="text-center">
                    {t.screenshotsBlocked}
                  </Caption>
                ) : null}
                {viewing.expiresAt ? (
                  <Caption className="text-center">
                    {t.letterAvailableUntil(formatDateTime(viewing.expiresAt))}
                  </Caption>
                ) : null}
              </>
            ) : (
              <ActivityIndicator className="py-10" />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
