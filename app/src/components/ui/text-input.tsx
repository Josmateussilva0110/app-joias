import React from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps,
} from "react-native-original";
import { fontFamilyForWeight } from "@/constants/typography";

export const AppTextInput = React.forwardRef<RNTextInput, TextInputProps>(
  function AppTextInput({ style, ...props }, ref) {
    const flat = StyleSheet.flatten(style);
    const fontFamily =
      typeof flat?.fontFamily === "string" && flat.fontFamily.length > 0
        ? flat.fontFamily
        : fontFamilyForWeight(flat?.fontWeight);

    return (
      <RNTextInput
        ref={ref}
        {...props}
        style={[style, { fontFamily }]}
        placeholderTextColor={props.placeholderTextColor}
      />
    );
  }
);

AppTextInput.displayName = "TextInput";
