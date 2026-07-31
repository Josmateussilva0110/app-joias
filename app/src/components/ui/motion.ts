import { FadeIn, FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

const MAX_STAGGER_INDEX = 12;
const STAGGER_STEP_MS = 45;

export const MOTION = {
  screen: FadeIn.duration(300),
  header: FadeInDown.duration(380).springify().damping(22).stiffness(180),
  cardUp: FadeInUp.delay(100).duration(420).springify().damping(20),
  fab: ZoomIn.delay(320).duration(480).springify().damping(14).stiffness(160),
  listItem: (index: number) =>
    FadeInDown.delay(Math.min(index, MAX_STAGGER_INDEX) * STAGGER_STEP_MS)
      .duration(420)
      .springify()
      .damping(20)
      .stiffness(170),
  listHeader: (index: number) =>
    FadeInDown.delay(index * 80)
      .duration(400)
      .springify()
      .damping(22),
} as const;

export const PRESS_SPRING = {
  damping: 18,
  stiffness: 320,
  mass: 0.6,
} as const;
