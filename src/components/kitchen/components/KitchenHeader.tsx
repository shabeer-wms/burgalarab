import React from "react";
import { LogOut, Settings } from "lucide-react";
import { StatusCounters } from "./StatusCounters";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface KitchenHeaderProps {
  currentTime: Date;
  totalOrders: number;
  pendingCount: number;
  inProgressCount: number;
  readyCount: number;
  onLogout: () => void;
  title?: string;
  isSettings?: boolean;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = () => null;
