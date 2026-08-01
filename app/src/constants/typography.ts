import { StyleSheet, type StyleProp, type TextStyle } from "react-native-original";
import { FontFamily, fontFamilyForWeight } from "@/constants/font-family";

export { FontFamily, fontFamilyForWeight };

export function resolveTextStyle(style?: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style);

  if (!flat) {
    return { fontFamily: FontFamily.regular };
  }

  const fontFamily =
    typeof flat.fontFamily === "string" && flat.fontFamily.length > 0
      ? flat.fontFamily
      : fontFamilyForWeight(flat.fontWeight);

  return [style, { fontFamily }];
}
