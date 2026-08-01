type FontWeightInput =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | undefined
  | null;

export const FontFamily = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
} as const;

export function fontFamilyForWeight(weight?: FontWeightInput): string {
  if (weight == null) return FontFamily.regular;

  const normalized =
    typeof weight === "number"
      ? weight
      : weight === "bold"
        ? 700
        : weight === "normal"
          ? 400
          : Number.parseInt(weight, 10);

  if (Number.isNaN(normalized)) return FontFamily.regular;
  if (normalized >= 800) return FontFamily.extraBold;
  if (normalized >= 700) return FontFamily.bold;
  if (normalized >= 600) return FontFamily.semiBold;
  if (normalized >= 500) return FontFamily.medium;
  return FontFamily.regular;
}
