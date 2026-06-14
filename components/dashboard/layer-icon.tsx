import {
  BadgeDollarSign,
  BarChart3,
  Building2,
  Factory,
  Globe2,
  Landmark,
  LineChart,
  UsersRound
} from "lucide-react";
import type { FinLayerId } from "@/lib/types";

const iconMap = {
  currency: Landmark,
  central_bank: Building2,
  fiscal: BadgeDollarSign,
  industry: Factory,
  corporate: BarChart3,
  geopolitical: Globe2,
  social: UsersRound,
  market: LineChart
};

export function LayerIcon({ layer, className }: { layer: FinLayerId; className?: string }) {
  const Icon = iconMap[layer];
  return <Icon className={className} aria-hidden />;
}

