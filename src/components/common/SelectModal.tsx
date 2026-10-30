import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export interface Option {
  label: string;
  value: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: Option[];
  selected?: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
}

/** Bottom-sheet picker. Used by the date-of-birth selects. */
export default function SelectModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: SelectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        {/* Swallows taps so they don't reach the backdrop. RN's Pressable
            event has no stopPropagation(), so an empty onPress is the way. */}
        <Pressable
          className="max-h-[70%] rounded-t-2xl bg-white pb-6"
          onPress={() => {}}
        >
          <View className="border-b border-gray-100 px-5 py-4">
            <Text className="font-inter-semibold text-[16px] text-ink">
              {title}
            </Text>
          </View>
          <ScrollView>
            {options.map((o) => {
              const isSel = o.value === selected;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => {
                    onSelect(o.value);
                    onClose();
                  }}
                  className={`px-5 py-3.5 ${isSel ? "bg-primary-soft" : ""}`}
                >
                  <Text
                    className={`text-base ${
                      isSel
                        ? "font-semibold text-primary"
                        : "text-gray-800"
                    }`}
                  >
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
