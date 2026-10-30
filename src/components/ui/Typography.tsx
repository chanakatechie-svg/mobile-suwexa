import { Text } from "react-native";
import type { TextProps } from "react-native";

/**
 * The text styles of the Figma design ("Suwexa · Patient App"), one component
 * each, so a screen says what a line of text IS rather than restating its
 * size, weight and leading. Colour defaults to the design's usual colour for
 * the style and can be overridden with `className`.
 */
type Props = TextProps & { className?: string };

const make =
  (base: string) =>
  ({ className = "", ...props }: Props) => (
    <Text className={`${base} ${className}`} {...props} />
  );

/** Display — Inter Bold 28/36. Screen titles. */
export const Display = make(
  "font-inter-bold text-[28px] leading-[36px] tracking-[-0.42px] text-ink",
);

/** Title — Inter SemiBold 20/28. Brand name, profile name. */
export const Title = make(
  "font-inter-semibold text-[20px] leading-[28px] tracking-[-0.2px] text-ink",
);

/** Body — Inter Regular 15/22. */
export const Body = make("font-inter text-[15px] leading-[22px] text-ink-muted");

/** Body Strong — Inter SemiBold 15/22. */
export const BodyStrong = make(
  "font-inter-semibold text-[15px] leading-[22px] text-ink",
);

/** Label — Inter Medium 14/20. Field labels, helper actions. */
export const Label = make("font-inter-medium text-[14px] leading-[20px] text-ink");

/** Caption — Inter Regular 13/18. */
export const Caption = make(
  "font-inter text-[13px] leading-[18px] text-ink-muted",
);

/** Section label — Inter SemiBold 13/18, uppercase, tracked. */
export const SectionLabel = make(
  "font-inter-semibold text-[13px] leading-[18px] tracking-[0.78px] uppercase text-ink-subtle",
);
