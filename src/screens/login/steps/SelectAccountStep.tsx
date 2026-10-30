import { ActivityIndicator, Pressable, Text, View } from "react-native";

import PlusPrimaryIcon from "../../../../assets/icons/plus-primary.svg";
import Button from "../../../components/ui/Button";
import StepLayout from "../../../components/ui/StepLayout";
import { AccountCard, FieldError, Notice } from "../../../components/ui/Blocks";
import { Body, Caption, Display } from "../../../components/ui/Typography";
import type { PortalStrings } from "../../../i18n";
import type {
  AccountPreview,
  ClinicPreview,
} from "../../../store/features/patientAuthSlice";

interface Props {
  t: PortalStrings;
  accounts: AccountPreview[];
  clinics: ClinicPreview[];
  canCreateNew: boolean;
  pickingClinic: boolean;
  countdown: string;
  urgent: boolean;
  loading: boolean;
  error: string | null;
  onSelect: (patientId: string) => void;
  onCreateNew: () => void;
  onChooseClinic: (clinicId: string) => void;
  onBackToAccounts: () => void;
  onUseDifferentPhone: () => void;
}

/** "Incomplete" tag in place of the chevron, for a half-registered account. */
function IncompleteTag({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-warning-soft px-2 py-0.5">
      <Text className="font-inter-semibold text-[11px] uppercase text-warning">
        {label}
      </Text>
    </View>
  );
}

/** Design screen 08 · Select account (plus the new-account clinic picker). */
export default function SelectAccountStep({
  t,
  accounts,
  clinics,
  canCreateNew,
  pickingClinic,
  countdown,
  urgent,
  loading,
  error,
  onSelect,
  onCreateNew,
  onChooseClinic,
  onBackToAccounts,
  onUseDifferentPhone,
}: Props) {
  return (
    <StepLayout
      footer={
        <>
          <Button
            text={t.useDifferentPhone}
            onPress={onUseDifferentPhone}
            variant="ghost"
          />
          <Caption className="text-center text-ink-subtle">{t.footer}</Caption>
        </>
      }
    >
      <View className="gap-1.5">
        <Display>
          {pickingClinic ? t.selectClinicTitle : t.selectAccountTitle}
        </Display>
        <Body>
          {pickingClinic ? t.selectClinicSubtitle : t.selectAccountSubtitle}
        </Body>
      </View>

      <Notice>
        <Text className={urgent ? "text-danger" : undefined}>
          {t.selectWithin(countdown)}
        </Text>
      </Notice>

      {pickingClinic ? (
        <View className="gap-3">
          {clinics.map((c) => (
            <AccountCard
              key={c.id}
              name={c.name}
              meta={t.clinicLabel}
              onPress={() => onChooseClinic(c.id)}
              disabled={loading}
            />
          ))}
          <Button
            text={t.backToAccounts}
            onPress={onBackToAccounts}
            variant="outline"
            disabled={loading}
          />
        </View>
      ) : (
        <View className="gap-3">
          {accounts.map((a) => (
            <AccountCard
              key={a.patientId}
              name={a.name?.trim() || t.unnamedPatient}
              // Patient code · clinic — the clinic tells apart accounts that
              // share one phone across practices.
              meta={`${a.patientCode} · ${a.clinicName || t.clinicLabel}`}
              onPress={() => onSelect(a.patientId)}
              disabled={loading}
              trailing={
                !a.isOnboarded ? <IncompleteTag label={t.incomplete} /> : undefined
              }
            />
          ))}

          {canCreateNew && (
            <Pressable
              onPress={onCreateNew}
              disabled={loading}
              accessibilityRole="button"
              className="h-14 flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-primary bg-primary-soft"
            >
              <PlusPrimaryIcon />
              <Text className="font-inter-semibold text-[15px] leading-[22px] text-primary">
                {t.createNewAccount}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {error && <FieldError message={error} />}
      {loading && <ActivityIndicator color="#23824a" />}
    </StepLayout>
  );
}
