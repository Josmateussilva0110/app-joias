import { ShieldCheck, UserCircle, Sparkles } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

export type WelcomeFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const WELCOME_FEATURES: WelcomeFeature[] = [
  {
    icon: ShieldCheck,
    title: "Conta segura",
    desc: "Autenticação com tokens e sessão protegida.",
  },
  {
    icon: UserCircle,
    title: "Perfil personalizado",
    desc: "Gerencie seus dados e preferências.",
  },
  {
    icon: Sparkles,
    title: "Pronto para evoluir",
    desc: "Base pronta para o seu próximo app.",
  },
];
