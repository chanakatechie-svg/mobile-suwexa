import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import type { MyAccount } from "../../store/features/patientAuthSlice";
import type { PortalStrings } from "../../i18n";

interface AccountSwitcherProps {
  visible: boolean;
  accounts: MyAccount[];
  loading: boolean;
  switching: boolean;
  error: string | null;
  t: PortalStrings;
  onSelect: (patientId: string) => void;
  onClose: () => void;
}

/**
 * Lets a patient move between their accounts at different clinics without
 * repeating the SMS OTP flow — the server re-scopes the existing session
 * (POST /patient-auth/switch-account).
 *
 * Accounts that haven't finished registration are shown but not selectable:
 * completing one needs the onboarding-token flow, which switch-account
 * deliberately does not issue.
 */
export default function AccountSwitcher({
  visible,
  accounts,
  loading,
  switching,
  error,
  t,
  onSelect,
  onClose,
}: AccountSwitcherProps) {
  const busy = loading || switching;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="max-h-[75%] rounded-t-2xl bg-white pb-6"
          onPress={() => {}}
        >
          <View className="border-b border-gray-100 px-5 py-4">
            <Text className="text-base font-semibold text-gray-900">
              {t.selectAccountTitle}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500">
              {t.selectAccountSubtitle}
            </Text>
          </View>

          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#1aac68" />
            </View>
          ) : (
            <ScrollView className="px-5 py-3">
              <View className="gap-2">
                {accounts.map((a) => {
                  const disabled = a.isCurrent || !a.isOnboarded || switching;
                  return (
                    <Pressable
                      key={a.patientId}
                      onPress={() => !disabled && onSelect(a.patientId)}
                      disabled={disabled}
                      className={`rounded-xl border px-4 py-3.5 ${
                        a.isCurrent
                          ? "border-main-green-300 bg-main-green-50"
                          : "border-gray-200 bg-white"
                      } ${!a.isOnboarded ? "opacity-60" : ""}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-2">
                          <Text className="text-sm font-semibold text-gray-900">
                            {a.clinicName || t.clinicLabel}
                          </Text>
                          <Text className="mt-0.5 text-xs text-gray-500">
                            {a.name?.trim() || t.unnamedPatient} ·{" "}
                            {a.patientCode}
                          </Text>
                        </View>

                        {a.isCurrent ? (
                          <View className="rounded-full bg-main-green-600 px-2 py-0.5">
                            <Text className="text-[10px] font-semibold text-white">
                              ✓
                            </Text>
                          </View>
                        ) : !a.isOnboarded ? (
                          <View className="rounded-full bg-amber-100 px-2 py-0.5">
                            <Text className="text-[10px] font-semibold uppercase text-amber-700">
                              {t.incomplete}
                            </Text>
                          </View>
                        ) : (
                          <Text className="text-gray-400">›</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}

                {accounts.length <= 1 && !loading && (
                  <Text className="py-4 text-center text-xs text-gray-400">
                    You only have one account on this phone number.
                  </Text>
                )}
              </View>

              {error ? (
                <Text className="mt-3 text-xs text-red-600">{error}</Text>
              ) : null}

              {switching && (
                <View className="mt-3 items-center">
                  <ActivityIndicator color="#1aac68" />
                </View>
              )}
            </ScrollView>
          )}

          <View className="px-5 pt-3">
            <Pressable
              onPress={onClose}
              disabled={busy}
              className={`items-center rounded-xl border border-gray-300 py-3 ${
                busy ? "opacity-50" : ""
              }`}
            >
              <Text className="font-medium text-gray-700">{t.cancel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
