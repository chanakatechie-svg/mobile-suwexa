import { ActivityIndicator, Text, View } from "react-native";

import Button from "../../../components/ui/Button";
import StepLayout from "../../../components/ui/StepLayout";
import { AccountCard, FieldError, Notice } from "../../../components/ui/Blocks";
import { Body, Caption, Display } from "../../../components/ui/Typography";
import type { PortalStrings } from "../../../i18n";
import type { ClinicPreview } from "../../../store/features/patientAuthSlice";

interface Props {
  t: PortalStrings;
  clinics: ClinicPreview[];
  countdown: string;
  urgent: boolean;
  loading: boolean;
  error: string | null;
  onChooseClinic: (clinicId: string) => void;
  onUseDifferentPhone: () => void;
}

/** New patient, no account yet: choose the clinic to register with. */
export default function SelectClinicStep({
  t,
  clinics,
  countdown,
  urgent,
  loading,
  error,
  onChooseClinic,
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
        <Display>{t.selectClinicTitle}</Display>
        <Body>{t.selectClinicSubtitle}</Body>
      </View>

      <Notice>
        <Text className={urgent ? "text-danger" : undefined}>
          {t.selectWithin(countdown)}
        </Text>
      </Notice>

      {/* Hidden while a single clinic auto-selects (see LoginScreen). */}
      {clinics.length > 1 && (
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
        </View>
      )}

      {error && <FieldError message={error} />}
      {(loading || clinics.length <= 1) && (
        <ActivityIndicator color="#23824a" />
      )}
    </StepLayout>
  );
}
