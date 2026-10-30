import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import AlertErrorIcon from "../../../../assets/icons/alert-error.svg";
import Button from "../../../components/ui/Button";
import Field from "../../../components/ui/Field";
import StepLayout from "../../../components/ui/StepLayout";
import CreatableMultiSelect from "../../../components/common/CreatableMultiSelect";
import DobDropdownInput from "../../../components/common/DobDropdownInput";
import type { Option } from "../../../components/common/SelectModal";
import {
  Chip,
  FieldError,
  FieldLabel,
  Notice,
} from "../../../components/ui/Blocks";
import { Body, Display, SectionLabel } from "../../../components/ui/Typography";
import type { PortalStrings } from "../../../i18n";

interface Props {
  t: PortalStrings;
  countdown: string;
  phxOptions: Option[];
  allergyOptions: Option[];
  loading: boolean;
  error: string | null;
  onSubmit: (payload: Record<string, unknown>) => void;
}

const fromOptions = (opts: Option[]): string[] =>
  opts.map((o) => o.value.trim()).filter(Boolean);

/** Red box at the top of the form listing that something needs fixing. */
function ErrorSummary({ message }: { message: string }) {
  return (
    <View className="flex-row items-center gap-2.5 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-3">
      <AlertErrorIcon />
      <Text className="flex-1 font-inter-medium text-[14px] leading-[20px] text-danger">
        {message}
      </Text>
    </View>
  );
}

/** Design screens 09–10 · Complete profile (form, and with errors). */
export default function ProfileStep({
  t,
  countdown,
  phxOptions,
  allergyOptions,
  loading,
  error,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [medicalHistory, setMedicalHistory] = useState<Option[]>([]);
  const [allergies, setAllergies] = useState<Option[]>([]);

  const [errors, setErrors] = useState<{
    name?: string;
    gender?: string;
    dob?: string;
  }>({});
  const scrollRef = useRef<ScrollView>(null);

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t.nameRequired;
    if (!gender) next.gender = t.genderRequired;
    if (!dob) next.dob = t.dobRequired;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // The error summary sits at the top, with the first invalid field
      // right under it.
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Same payload shape as the web version: optional fields only when set.
    const payload: Record<string, unknown> = { name: name.trim(), gender };
    if (dob) payload.dateOfBirth = dob;
    if (weight) payload.weight = parseFloat(weight);
    if (height) payload.height = parseFloat(height);
    if (address) payload.address = address;
    if (email) payload.email = email;
    const phx = fromOptions(medicalHistory);
    if (phx.length) payload.medicalHistory = phx;
    const alg = fromOptions(allergies);
    if (alg.length) payload.allergies = alg;

    onSubmit(payload);
  };

  const GENDERS: [string, string][] = [
    ["Male", t.male],
    ["Female", t.female],
    ["Other", t.other],
  ];
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <StepLayout
      scrollRef={scrollRef}
      raisedFooter
      footer={
        <Button
          text={t.saveProfile}
          onPress={handleSubmit}
          loading={loading}
        />
      }
    >
      <View className="gap-1.5">
        <Display>{t.completeProfileTitle}</Display>
        <Body>{t.completeProfileSubtitle}</Body>
      </View>

      {hasErrors ? (
        <ErrorSummary message={t.fixErrors} />
      ) : (
        <Notice>{t.completeIn(countdown)}</Notice>
      )}

      {/* ── Personal details ─────────────────────────────────────────── */}
      <View className="gap-4">
        <SectionLabel>{t.sectionPersonal}</SectionLabel>

        <Field
          label={t.fullName}
          required
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (errors.name && v.trim()) setErrors((e) => ({ ...e, name: undefined }));
          }}
          placeholder={t.fullNamePlaceholder}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
        />

        <View className="gap-2">
          <FieldLabel label={t.gender} required />
          <View className="flex-row gap-2">
            {GENDERS.map(([val, label]) => (
              <Chip
                key={val}
                label={label}
                selected={gender === val}
                className="flex-1"
                onPress={() => {
                  setGender(val);
                  setErrors((e) => ({ ...e, gender: undefined }));
                }}
              />
            ))}
          </View>
          {errors.gender ? <FieldError message={errors.gender} /> : null}
        </View>

        <Notice type="info">{t.dateOfBirthHint}</Notice>

        <DobDropdownInput
          label={t.dateOfBirth}
          dayLabel={t.day}
          monthLabel={t.month}
          yearLabel={t.year}
          required
          value={dob}
          onChange={(v) => {
            setDob(v);
            if (v) setErrors((e) => ({ ...e, dob: undefined }));
          }}
          error={errors.dob}
        />
      </View>

      {/* ── Body measurements ────────────────────────────────────────── */}
      <View className="gap-4">
        <SectionLabel>{t.sectionBody}</SectionLabel>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field
              label={t.weightKg}
              value={weight}
              onChangeText={setWeight}
              placeholder={t.weightPlaceholder}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <Field
              label={t.heightCm}
              value={height}
              onChangeText={setHeight}
              placeholder={t.heightPlaceholder}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <View className="gap-4">
        <SectionLabel>{t.sectionContact}</SectionLabel>
        <Field
          label={t.address}
          value={address}
          onChangeText={setAddress}
          placeholder={t.addressPlaceholder}
          multiline
        />
        <Field
          label={t.email}
          value={email}
          onChangeText={setEmail}
          placeholder={t.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      {/* ── Medical ──────────────────────────────────────────────────── */}
      <View className="gap-4">
        <SectionLabel>{t.sectionMedical}</SectionLabel>
        <CreatableMultiSelect
          label={t.medicalHistory}
          placeholder={t.medicalHistoryPlaceholder}
          options={phxOptions}
          value={medicalHistory}
          onChange={setMedicalHistory}
        />
        <CreatableMultiSelect
          label={t.allergies}
          placeholder={t.allergiesPlaceholder}
          options={allergyOptions}
          value={allergies}
          onChange={setAllergies}
        />
      </View>

      {error ? <FieldError message={error} /> : null}
    </StepLayout>
  );
}
