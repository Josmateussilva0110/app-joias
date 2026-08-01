import { Gem, Users, CircleDollarSign } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

export type WelcomeFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const WELCOME_FEATURES: WelcomeFeature[] = [
  {
    icon: Gem,
    title: "Catálogo de joias",
    desc: "Colares, pulseiras, brincos, anéis e muito mais.",
  },
  {
    icon: Users,
    title: "Clientes e vendas",
    desc: "Registre quem comprou, o que levou e quando.",
  },
  {
    icon: CircleDollarSign,
    title: "Controle financeiro",
    desc: "Acompanhe pagamentos, totais e valores em aberto.",
  },
];

export const APP_NAME = "Sintonia";
