import { ScrollView, View } from "react-native";
import type { ReactNode, RefObject } from "react";

/**
 * One full screen of the design: scrolling content (24 side padding, 24 gap)
 * above a footer pinned to the bottom holding the main action.
 *
 * `raisedFooter` is the white, top-bordered footer of the long profile form,
 * where content scrolls underneath it.
 */
export default function StepLayout({
  children,
  footer,
  raisedFooter = false,
  scrollRef,
}: {
  children: ReactNode;
  footer?: ReactNode;
  raisedFooter?: boolean;
  /** Lets a form scroll back to its error summary. */
  scrollRef?: RefObject<ScrollView | null>;
}) {
  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-6 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          className={`gap-3 px-6 pb-2 pt-3 ${
            raisedFooter ? "border-t border-line bg-surface" : ""
          }`}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
