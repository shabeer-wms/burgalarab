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
      {/* Mobile counters - Hidden on mobile screens */}
      <div className="hidden">
        {/* Mobile counters removed from mobile view */}
      </div>

      {/* Tablet and Desktop counters */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 justify-end">
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
