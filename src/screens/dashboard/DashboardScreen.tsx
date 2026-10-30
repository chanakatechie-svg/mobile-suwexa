import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoSmIcon from "../../../assets/icons/logo-sm.svg";
import LogoutIcon from "../../../assets/icons/logout.svg";
import UserPrimaryIcon from "../../../assets/icons/user-primary.svg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMyAccounts,
  fetchPatientProfile,
  patientLogout,
  switchAccount,
  updatePatientProfile,
} from "../../store/features/patientAuthSlice";
import type { PatientProfile } from "../../store/features/patientAuthSlice";
import { usePortalLanguage } from "../../hooks/usePortalLanguage";
import AccountSwitcher from "../../components/common/AccountSwitcher";
import { BadgeVerified, Chip } from "../../components/ui/Blocks";
import {
  BodyStrong,
  Caption,
  Label,
  Title,
} from "../../components/ui/Typography";
import EditDetailsSheet from "./EditDetailsSheet";
import toast from "../../utils/toast";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2007-02-01" → "Feb 1, 2007". Read from the ISO parts — a date of birth
 *  has no time, so going through Date could shift it a day. */
function formatDob(iso: string | null): string {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : "—";
}

/** "+94777840166" → "+94 77 784 0166". */
const formatPhone = (e164: string) =>
  e164.replace(/^\+94(\d{2})(\d{3})(\d{4})$/, "+94 $1 $2 $3");

/** Share of the profile filled in, for the completion card. */
function completion(p: PatientProfile): number {
  const fields = [
    p.name,
    p.dateOfBirth,
    p.gender,
    p.weight,
    p.height,
    p.email,
    p.address,
  ];
  const filled = fields.filter((v) => v !== null && v !== undefined && v !== "").length;
  return Math.round((filled / fields.length) * 100);
}

/** One labelled value in the Personal details card. */
function Detail({ label, value }: { label: string; value: string | null }) {
  const empty = !value;
  return (
    <View className="flex-1 gap-0.5">
      <Text className="font-inter-semibold text-[11px] uppercase leading-[18px] tracking-[0.66px] text-ink-subtle">
        {label}
      </Text>
      <Text
        className={`font-inter text-[15px] leading-[22px] ${
          empty ? "text-ink-subtle" : "text-ink"
        }`}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

/** Design screen 11 · Patient profile (home). */
export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { lang, setLang, t } = usePortalLanguage();
  const {
    token,
    profile,
    profileLoading,
    myAccounts,
    myAccountsLoading,
    switchLoading,
    switchError,
    updateLoading,
    updateError,
  } = useAppSelector((s) => s.patientAuth);
  const [refreshing, setRefreshing] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const openSwitcher = () => {
    setSwitcherOpen(true);
    if (token) dispatch(fetchMyAccounts(token));
  };

  const handleSwitch = async (patientId: string) => {
    if (!token) return;
    const res = await dispatch(switchAccount({ token, patientId }));
    if (switchAccount.fulfilled.match(res)) {
      setSwitcherOpen(false);
      toast.success(`Switched to ${res.payload.clinicName}`);
      // The reducer cleared the old profile; refetch with the new token.
      dispatch(fetchPatientProfile(res.payload.accessToken));
    }
  };

  const handleSaveDetails = async (changes: Record<string, unknown>) => {
    if (!token) return;
    if (Object.keys(changes).length === 0) {
      toast.error(t.noChangesToSave);
      return;
    }
    const res = await dispatch(updatePatientProfile({ token, payload: changes }));
    if (updatePatientProfile.fulfilled.match(res)) {
      setEditOpen(false);
      toast.success(t.profileUpdated);
    } else if ((res.payload as { expired?: boolean } | undefined)?.expired) {
      toast.error(t.sessionExpired);
      dispatch(patientLogout());
    }
  };

  const load = useCallback(async () => {
    if (!token) return;
    const res = await dispatch(fetchPatientProfile(token));
    if (fetchPatientProfile.rejected.match(res)) {
      const p = res.payload as { expired?: boolean } | undefined;
      if (p?.expired) {
        toast.error(t.sessionExpired);
        dispatch(patientLogout());
      }
    }
  }, [dispatch, token, t]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const pct = profile ? completion(profile) : 0;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      {/* ── App bar ──────────────────────────────────────────────────── */}
      <View className="flex-row items-center gap-3 border-b border-line bg-surface px-5 pb-3 pt-2">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand">
          <LogoSmIcon />
        </View>
        <View className="flex-1">
          <BodyStrong>{t.appName}</BodyStrong>
          {/* Which clinic's records these are — tappable to switch, since a
              phone can hold accounts at several clinics. */}
          {profile?.clinicName ? (
            <Pressable onPress={openSwitcher} hitSlop={6} accessibilityRole="button">
              <Caption numberOfLines={1}>
                {profile.clinicName} ▾
              </Caption>
            </Pressable>
          ) : (
            <Caption>{t.portal}</Caption>
          )}
        </View>
        <Pressable
          onPress={() => dispatch(patientLogout())}
          accessibilityRole="button"
          className="h-10 flex-row items-center gap-1.5 rounded-[20px] border border-line bg-surface pl-3 pr-3.5"
        >
          <LogoutIcon />
          <Label>{t.signOut}</Label>
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="gap-4 p-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {profileLoading && !profile ? (
          <>
            <View className="h-60 rounded-[20px] bg-line" />
            <View className="h-64 rounded-[20px] bg-line" />
          </>
        ) : profile ? (
          <>
            {/* ── Profile card ─────────────────────────────────────── */}
            <View className="gap-4 rounded-[20px] border border-line bg-surface p-5">
              <View className="flex-row items-start gap-3.5">
                <View className="h-16 w-16 items-center justify-center rounded-[32px] bg-primary-soft">
                  <UserPrimaryIcon />
                </View>
                <View className="flex-1 gap-0.5">
                  <Title numberOfLines={1}>{profile.name || "—"}</Title>
                  <Caption>{profile.patientCode}</Caption>
                  <Label>{formatPhone(profile.phoneNumber)}</Label>
                </View>
                {profile.isPhoneVerified && <BadgeVerified label={t.verified} />}
              </View>

              {pct < 100 && (
                <View className="gap-2.5 rounded-[14px] bg-primary-soft px-4 py-3.5">
                  <View className="flex-row items-start justify-between">
                    <BodyStrong>{t.profileComplete(pct)}</BodyStrong>
                    <Pressable
                      onPress={() => setEditOpen(true)}
                      hitSlop={8}
                      accessibilityRole="button"
                    >
                      <Text className="font-inter-semibold text-[14px] leading-[20px] text-primary">
                        {t.completeAction}
                      </Text>
                    </Pressable>
                  </View>
                  <View className="h-1.5 overflow-hidden rounded-[3px] bg-primary-line">
                    <View
                      className="h-1.5 rounded-[3px] bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                  <Caption>{t.profileCompletionHint}</Caption>
                </View>
              )}
            </View>

            {/* ── Personal details card ────────────────────────────── */}
            <View className="overflow-hidden rounded-[20px] border border-line bg-surface">
              <View className="flex-row items-start justify-between px-5 pb-1 pt-4">
                <BodyStrong>{t.personalDetails}</BodyStrong>
                <Pressable
                  onPress={() => setEditOpen(true)}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text className="font-inter-semibold text-[14px] leading-[20px] text-primary">
                    {t.edit}
                  </Text>
                </Pressable>
              </View>
              <View className="flex-row gap-4 px-5 py-3.5">
                <Detail label={t.dateOfBirth} value={formatDob(profile.dateOfBirth)} />
                <Detail label={t.gender} value={profile.gender} />
              </View>
              <View className="flex-row gap-4 border-t border-line px-5 py-3.5">
                <Detail
                  label={t.weight}
                  value={profile.weight ? `${profile.weight} kg` : null}
                />
                <Detail
                  label={t.height}
                  value={profile.height ? `${profile.height} cm` : null}
                />
              </View>
              <View className="flex-row gap-4 border-t border-line px-5 py-3.5">
                <Detail label={t.email} value={profile.email} />
                <Detail label={t.address} value={profile.address} />
              </View>
            </View>

            {/* ── Medical (existing data, in the same card style) ──────── */}
            <View className="gap-3 rounded-[20px] border border-line bg-surface p-5">
              <BodyStrong>{t.medicalHistory}</BodyStrong>
              {profile.medicalHistory?.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {profile.medicalHistory.map((x) => (
                    <Chip key={x} label={x} selected />
                  ))}
                </View>
              ) : (
                <Caption className="text-ink-subtle">—</Caption>
              )}
              <BodyStrong className="mt-1">{t.allergies}</BodyStrong>
              {profile.allergies?.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {profile.allergies.map((x) => (
                    <Chip key={x} label={x} selected />
                  ))}
                </View>
              ) : (
                <Caption className="text-ink-subtle">—</Caption>
              )}
            </View>

            {/* Language — kept from the previous version of the app. */}
            <View className="flex-row justify-center">
              <View className="flex-row overflow-hidden rounded-full border border-line bg-surface">
                {(["en", "si"] as const).map((l) => (
                  <Pressable
                    key={l}
                    onPress={() => setLang(l)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: lang === l }}
                    className={`px-4 py-2 ${lang === l ? "bg-primary" : ""}`}
                  >
                    <Text
                      className={`font-inter-medium text-[12px] ${
                        lang === l ? "text-white" : "text-ink-muted"
                      }`}
                    >
                      {l === "en" ? "English" : "සිංහල"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          <Caption>{t.tryAgain}</Caption>
        )}
      </ScrollView>

      {profile && (
        <EditDetailsSheet
          visible={editOpen}
          profile={profile}
          t={t}
          saving={updateLoading}
          error={updateError}
          onSave={handleSaveDetails}
          onClose={() => setEditOpen(false)}
        />
      )}

      <AccountSwitcher
        visible={switcherOpen}
        accounts={myAccounts}
        loading={myAccountsLoading}
        switching={switchLoading}
        error={switchError}
        t={t}
        onSelect={handleSwitch}
        onClose={() => setSwitcherOpen(false)}
      />
    </SafeAreaView>
  );
}
