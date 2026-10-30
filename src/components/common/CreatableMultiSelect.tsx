import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import SelectField from "../ui/SelectField";
import { Chip, FieldLabel } from "../ui/Blocks";
import type { Option } from "./SelectModal";

interface CreatableMultiSelectProps {
  value: Option[];
  onChange: (next: Option[]) => void;
  options: Option[];
  label: string;
  placeholder?: string;
}

/**
 * Replaces react-select/creatable (no good RN equivalent).
 *
 * Keeps the same Option[] ({label,value}) value shape as the web component so
 * the ported `fromOptions()` payload helper works unchanged.
 */
export default function CreatableMultiSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Type or select…",
}: CreatableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedValues = useMemo(
    () => new Set(value.map((v) => v.value.toLowerCase())),
    [value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) =>
        !selectedValues.has(o.value.toLowerCase()) &&
        (q === "" || o.label.toLowerCase().includes(q)),
    );
  }, [options, query, selectedValues]);

  const canCreate =
    query.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase()) &&
    !selectedValues.has(query.trim().toLowerCase());

  const add = (opt: Option) => {
    onChange([...value, opt]);
    setQuery("");
  };

  const remove = (v: string) =>
    onChange(value.filter((o) => o.value !== v));

  return (
    <View className="gap-2">
      <FieldLabel label={label} />

      {/* Input / Select: always the placeholder — the picks live as chips
          below it, as in the design's Medical section. */}
      <SelectField
        placeholder={placeholder}
        onPress={() => setOpen(true)}
        accessibilityLabel={label}
      />

      {value.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {value.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              selected
              onPress={() => remove(o.value)}
            />
          ))}
        </View>
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          {/* Empty onPress swallows the tap — RN Pressable has no
              stopPropagation() on its event object. */}
          <Pressable
            className="max-h-[75%] rounded-t-2xl bg-white pb-6"
            onPress={() => {}}
          >
            <View className="border-b border-gray-100 px-5 py-4">
              <Text className="text-base font-semibold text-gray-900">
                {label}
              </Text>
            </View>

            <View className="px-5 py-3">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900"
              />
            </View>

            {value.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 px-5 pb-3">
                {value.map((o) => (
                  <Pressable
                    key={o.value}
                    onPress={() => remove(o.value)}
                    className="flex-row items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1"
                  >
                    <Text className="text-xs font-medium text-primary">
                      {o.label} ×
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <ScrollView keyboardShouldPersistTaps="handled">
              {canCreate && (
                <Pressable
                  onPress={() =>
                    add({ label: query.trim(), value: query.trim() })
                  }
                  className="border-b border-gray-100 px-5 py-3.5"
                >
                  <Text className="text-base text-primary">
                    Add “{query.trim()}”
                  </Text>
                </Pressable>
              )}
              {filtered.map((o) => (
                <Pressable
                  key={o.value}
                  onPress={() => add(o)}
                  className="px-5 py-3.5"
                >
                  <Text className="text-base text-gray-800">{o.label}</Text>
                </Pressable>
              ))}
              {filtered.length === 0 && !canCreate && (
                <Text className="px-5 py-4 text-sm text-gray-400">
                  No options
                </Text>
              )}
            </ScrollView>

            <View className="px-5 pt-3">
              <Pressable
                onPress={() => setOpen(false)}
                className="h-14 items-center justify-center rounded-[14px] bg-primary"
              >
                <Text className="font-inter-semibold text-[16px] text-white">Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
