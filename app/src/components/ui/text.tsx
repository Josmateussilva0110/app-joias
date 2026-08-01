import React from "react";
import {
  Text as RNText,
  StyleSheet,
  type TextProps,
} from "react-native-original";
import { fontFamilyForWeight } from "@/constants/typography";

export const AppText = React.forwardRef<RNText, TextProps>(function AppText(
  { style, ...props },
  ref
) {
  const flat = StyleSheet.flatten(style);
  const fontFamily =
    typeof flat?.fontFamily === "string" && flat.fontFamily.length > 0
      ? flat.fontFamily
      : fontFamilyForWeight(flat?.fontWeight);

  return (
    <RNText
      ref={ref}
      {...props}
      style={[style, { fontFamily }]}
    />
  );
});

AppText.displayName = "Text";
