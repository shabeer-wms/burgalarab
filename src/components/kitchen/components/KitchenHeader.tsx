import React from "react";
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
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  currentTime,
  totalOrders,
  pendingCount,
  inProgressCount,
  readyCount,
  onLogout,
}) => {
  return (
    <header
      className={`${kitchenColors.ui.layout.card} ${kitchenLayout.responsive.header.padding} rounded-2xl ${kitchenLayout.responsive.header.margin} ${kitchenLayout.responsive.header.minHeight}`}
    >
      <div
        className={`flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 lg:gap-4`}
      >
        <div className="flex items-center w-full md:w-auto justify-between">
          <div className="flex items-center min-w-0 flex-1">
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
                Kitchen Display System
              </h1>
              <p
                className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.header.subtitle} tabular-nums truncate`}
              >
                {currentTime.toLocaleTimeString()} | {totalOrders} Active Orders
              </p>
            </div>
          </div>

          {/* Logout button for tablets and mobile */}
          <button
            onClick={onLogout}
            className={`lg:hidden ml-2 p-2 rounded-md ${kitchenColors.ui.button.danger} flex items-center flex-shrink-0`}
            aria-label="Logout"
          >
            <span className="material-icons text-lg">logout</span>
          </button>
        </div>

        <StatusCounters
          pendingCount={pendingCount}
          inProgressCount={inProgressCount}
          readyCount={readyCount}
        />
      </div>
    </header>
  );
};
