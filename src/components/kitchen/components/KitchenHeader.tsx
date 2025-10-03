import React from "react";
import { LogOut } from "lucide-react";
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
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  currentTime,
  totalOrders,
  pendingCount,
  inProgressCount,
  readyCount,
  onLogout,
  title,
}) => {
  return (
    <header
      className={`${kitchenColors.ui.layout.card} ${kitchenLayout.responsive.header.padding} rounded-2xl ${kitchenLayout.responsive.header.margin} ${kitchenLayout.responsive.header.minHeight}`}
    >
      <div
        className={`flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 lg:gap-4`}
      >
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center min-w-0 flex-1 md:flex-initial">
            <div
              className={`${kitchenColors.ui.layout.header} ${kitchenLayout.sizing.icon.header} rounded-xl mr-3 flex-shrink-0 flex items-center justify-center`}
            >
              <span
                className={`material-icons ${kitchenColors.ui.layout.headerIcon}`}
                style={{ fontSize: 18 }}
              >
                kitchen
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h1
                className={`${kitchenLayout.typography.header.title} ${kitchenColors.ui.primary.text} truncate`}
              >
                {title || "Kitchen Display System"}
              </h1>
              <p
                className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.header.subtitle} tabular-nums truncate`}
              >
                {currentTime.toLocaleTimeString()} | {totalOrders} Active Orders
              </p>
            </div>
          </div>

          {/* Logout button for mobile only removed; use bottom navigation instead */}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto md:justify-end">
          <div className="flex-1 md:flex-initial">
            <StatusCounters
              pendingCount={pendingCount}
              inProgressCount={inProgressCount}
              readyCount={readyCount}
            />
          </div>

          {/* Logout button for tablet and desktop - positioned at the right */}
          <button
            onClick={onLogout}
            className={`hidden md:flex lg:hidden p-2 rounded-md ${kitchenColors.ui.button.danger} items-center flex-shrink-0`}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
