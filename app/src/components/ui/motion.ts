import { Easing, FadeIn, FadeInUp } from "react-native-reanimated";

const MAX_STAGGER_INDEX = 12;
const STAGGER_STEP_MS = 30;
const EASE_OUT = Easing.out(Easing.cubic);

export const MOTION = {
  screen: FadeIn.duration(260).easing(EASE_OUT),
  header: FadeIn.duration(280).easing(EASE_OUT),
  cardUp: FadeInUp.duration(300).delay(60).easing(EASE_OUT),
  fab: FadeIn.duration(280).delay(100).easing(EASE_OUT),
  listItem: (index: number) =>
    FadeIn.duration(220)
      .delay(Math.min(index, MAX_STAGGER_INDEX) * STAGGER_STEP_MS)
      .easing(EASE_OUT),
  listHeader: (index: number) =>
    FadeIn.duration(240).delay(index * 40).easing(EASE_OUT),
} as const;

export const PRESS_SPRING = {
  damping: 22,
  stiffness: 280,
  mass: 0.65,
} as const;
