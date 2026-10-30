import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import { FieldError } from "../../components/ui/Blocks";
import { Title } from "../../components/ui/Typography";
import type { PortalStrings } from "../../i18n";
import type { PatientProfile } from "../../store/features/patientAuthSlice";

interface Props {
  visible: boolean;
  profile: PatientProfile;
  t: PortalStrings;
  saving: boolean;
  error: string | null;
  onSave: (changes: Record<string, unknown>) => void;
  onClose: () => void;
}

const asText = (v: number | string | null | undefined) =>
  v == null ? "" : String(v);

/**
 * Edit the optional details the profile-completion card asks for — weight,
 * height, email and address. Behind the design's "Edit" and "Complete"
 * actions. Only changed fields are sent.
 */
export default function EditDetailsSheet({
  visible,
  profile,
  t,
  saving,
  error,
  onSave,
  onClose,
}: Props) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Start from the current values each time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setWeight(asText(profile.weight));
    setHeight(asText(profile.height));
    setEmail(profile.email ?? "");
    setAddress(profile.address ?? "");
  }, [visible, profile]);

  const save = () => {
    const changes: Record<string, unknown> = {};
    if (weight !== asText(profile.weight) && weight) changes.weight = parseFloat(weight);
    if (height !== asText(profile.height) && height) changes.height = parseFloat(height);
    if (email.trim() !== (profile.email ?? "")) changes.email = email.trim();
    if (address.trim() !== (profile.address ?? "")) changes.address = address.trim();
    onSave(changes);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Empty onPress swallows taps so they don't reach the backdrop. */}
          <Pressable className="rounded-t-[20px] bg-surface pb-6" onPress={() => {}}>
            <View className="border-b border-line px-6 py-4">
              <Title>{t.personalDetails}</Title>
            </View>
            <ScrollView
              contentContainerClassName="gap-4 px-6 pt-5"
              keyboardShouldPersistTaps="handled"
            >
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
              <Field
                label={t.email}
                value={email}
                onChangeText={setEmail}
                placeholder={t.emailPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Field
                label={t.address}
                value={address}
                onChangeText={setAddress}
                placeholder={t.addressPlaceholder}
                multiline
              />
              {error ? <FieldError message={error} /> : null}
              <View className="flex-row gap-3 pt-2">
                <Button
                  text={t.cancel}
                  onPress={onClose}
                  variant="outline"
                  className="flex-1"
                />
                <Button
                  text={t.saveChanges}
                  onPress={save}
                  loading={saving}
                  className="flex-1"
                />
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
