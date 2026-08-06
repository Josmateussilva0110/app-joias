import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

const BASE = {
  headerShown: false,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
} as const satisfies Partial<NativeStackNavigationOptions>;

/** Navegação padrão — empurra da direita (estilo iOS). */
export const pushTransition: NativeStackNavigationOptions = {
  ...BASE,
  animation: "ios_from_right",
  animationDuration: 300,
};

/** Telas de formulário / cadastro — sobem suavemente como modal. */
export const modalTransition: NativeStackNavigationOptions = {
  ...BASE,
  animation: "fade_from_bottom",
  animationDuration: 320,
  presentation: "modal",
};

/** Dashboards e telas secundárias — fade discreto. */
export const fadeTransition: NativeStackNavigationOptions = {
  ...BASE,
  animation: "fade",
  animationDuration: 280,
};

/** Abas principais — fade suave ao trocar de seção. */
export const tabTransition: NativeStackNavigationOptions = {
  ...BASE,
  animation: "fade",
  animationDuration: 320,
};

export function withBackground(
  colors: { background: string },
  options: NativeStackNavigationOptions
): NativeStackNavigationOptions {
  return {
    ...options,
    contentStyle: { backgroundColor: colors.background },
  };
}
