import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import SelectField from "../ui/SelectField";
import { FieldError, FieldLabel } from "../ui/Blocks";
import SelectModal from "./SelectModal";
import type { Option } from "./SelectModal";

interface DobDropdownInputProps {
  /** ISO date "YYYY-MM-DD", or "" when unset. */
  value: string;
  onChange: (iso: string) => void;
  label: string;
  /** Placeholders for the three selects. */
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  error?: string;
  required?: boolean;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Parse "YYYY-MM-DD" without going through Date (which reads it as UTC). */
function parseIso(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) } : null;
}

const daysIn = (y: number | null, m: number | null) =>
  m == null ? 31 : new Date(y ?? 2000, m + 1, 0).getDate(); // 2000 is leap: Feb → 29

type Picker = "day" | "month" | "year" | null;

/**
 * Date of birth as the design's three selects: Day · Month · Year.
 *
 * Per the design's spec: the Day list respects the month and leap years, and
 * the date cannot be in the future. Each part can be picked in any order; the
 * ISO date is emitted only once all three are set (and "" otherwise), so the
 * API contract is unchanged.
 */
export default function DobDropdownInput({
  value,
  onChange,
  label,
  dayLabel,
  monthLabel,
  yearLabel,
  error,
  required,
}: DobDropdownInputProps) {
  const parsed = parseIso(value);
  const [y, setY] = useState<number | null>(parsed?.y ?? null);
  const [m, setM] = useState<number | null>(parsed?.m ?? null);
  const [d, setD] = useState<number | null>(parsed?.d ?? null);
  const [open, setOpen] = useState<Picker>(null);

  const today = new Date();
  const thisYear = today.getFullYear();

  // A day that no longer exists (31 → February) is dropped, not silently moved.
  useEffect(() => {
    if (d != null && d > daysIn(y, m)) setD(null);
  }, [y, m, d]);

  useEffect(() => {
    onChange(y != null && m != null && d != null ? `${y}-${pad(m + 1)}-${pad(d)}` : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [y, m, d]);

  const isFuture = (yy: number, mm: number, dd: number) =>
    new Date(yy, mm, dd) > today;

  const dayOptions: Option[] = useMemo(
    () =>
      Array.from({ length: daysIn(y, m) }, (_, i) => i + 1)
        .filter((n) => y == null || m == null || !isFuture(y, m, n))
        .map((n) => ({ label: String(n), value: String(n) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [y, m],
  );
  const monthOptions: Option[] = MONTHS.map((name, i) => ({
    label: name,
    value: String(i),
  })).filter((o) => y !== thisYear || Number(o.value) <= today.getMonth());
  const yearOptions: Option[] = Array.from({ length: 121 }, (_, i) => {
    const yy = thisYear - i;
    return { label: String(yy), value: String(yy) };
  });

  return (
    <View className="gap-2">
      <FieldLabel label={label} required={required} />
      <View className="flex-row gap-2">
        <SelectField
          className="flex-1"
          value={d != null ? String(d) : null}
          placeholder={dayLabel}
          onPress={() => setOpen("day")}
          error={!!error && d == null}
        />
        <SelectField
          className="flex-1"
          value={m != null ? MONTHS[m] : null}
          placeholder={monthLabel}
          onPress={() => setOpen("month")}
          error={!!error && m == null}
        />
        <SelectField
          className="flex-1"
          value={y != null ? String(y) : null}
          placeholder={yearLabel}
          onPress={() => setOpen("year")}
          error={!!error && y == null}
        />
      </View>
      {error ? <FieldError message={error} /> : null}

      <SelectModal
        visible={open === "day"}
        title={dayLabel}
        options={dayOptions}
        selected={d != null ? String(d) : null}
        onSelect={(v) => setD(Number(v))}
        onClose={() => setOpen(null)}
      />
      <SelectModal
        visible={open === "month"}
        title={monthLabel}
        options={monthOptions}
        selected={m != null ? String(m) : null}
        onSelect={(v) => setM(Number(v))}
        onClose={() => setOpen(null)}
      />
      <SelectModal
        visible={open === "year"}
        title={yearLabel}
        options={yearOptions}
        selected={y != null ? String(y) : null}
        onSelect={(v) => {
          const yy = Number(v);
          setY(yy);
          // Picking this year can make the chosen month lie in the future.
          if (yy === thisYear && m != null && m > today.getMonth()) setM(null);
        }}
        onClose={() => setOpen(null)}
      />
    </View>
  );
}
