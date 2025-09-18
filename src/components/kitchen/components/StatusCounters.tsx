import React from "react";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface StatusCountersProps {
  pendingCount: number;
  inProgressCount: number;
  readyCount: number;
}

export const StatusCounters: React.FC<StatusCountersProps> = ({
  pendingCount,
  inProgressCount,
  readyCount,
}) => {
  return (
    <div className="w-full lg:w-96">
      {/* Mobile and tablet counters */}
      <div
        className="grid gap-2 sm:gap-3 w-full lg:hidden"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
        }}
      >
        <div className="flex flex-col items-center">
          <p
            className={`${kitchenLayout.typography.header.counters.mobile} ${kitchenColors.status.pending.primary} ${kitchenLayout.sizing.counter.width} text-center`}
          >
            {pendingCount}
          </p>
          <p
            className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.counters.mobile}`}
          >
            Pending
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p
            className={`${kitchenLayout.typography.header.counters.mobile} ${kitchenColors.status.inProgress.primary} ${kitchenLayout.sizing.counter.width} text-center`}
          >
            {inProgressCount}
          </p>
          <p
            className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.counters.mobile} whitespace-nowrap`}
          >
            In Progress
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p
            className={`${kitchenLayout.typography.header.counters.mobile} ${kitchenColors.status.ready.primary} ${kitchenLayout.sizing.counter.width} text-center`}
          >
            {readyCount}
          </p>
          <p
            className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.counters.mobile}`}
          >
            Ready
          </p>
        </div>
      </div>

      {/* Desktop counters */}
      <div className={`hidden ${kitchenLayout.grid.statusCounters.desktop}`}>
        <div className="flex flex-col items-center">
          <p
            className={`${kitchenLayout.typography.header.counters.desktop} ${kitchenColors.status.pending.primary} ${kitchenLayout.sizing.counter.widthDesktop} text-center tabular-nums`}
          >
            {pendingCount}
          </p>
          <p
            className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.counters.desktop}`}
          >
            Pending
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p
            className={`${kitchenLayout.typography.header.counters.desktop} ${kitchenColors.status.inProgress.primary} ${kitchenLayout.sizing.counter.widthDesktop} text-center tabular-nums`}
          >
            {inProgressCount}
          </p>
          <p
            className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.counters.desktop}`}
          >
            In Progress
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p
            className={`${kitchenLayout.typography.header.counters.desktop} ${kitchenColors.status.ready.primary} ${kitchenLayout.sizing.counter.widthDesktop} text-center tabular-nums`}
          >
            {readyCount}
          </p>
          <p
            className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.counters.desktop}`}
          >
            Ready
          </p>
        </div>
      </div>
    </div>
  );
};
