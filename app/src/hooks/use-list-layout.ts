import { useWindowDimensions } from "react-native";

export function useListLayout() {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;

  return {
    width,
    horizontalPadding: width < 360 ? 12 : width < 768 ? 16 : 24,
    contentMaxWidth: isTablet ? 760 : undefined,
    isCompact,
    isTablet,
  };
}
