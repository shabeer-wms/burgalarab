import React, { useRef } from "react";
import { KitchenDisplayItem, OrderItem } from "../../../types";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface KitchenOrderCardProps {
  order: KitchenDisplayItem;
  currentTime: Date;
  onStatusChange: (
    orderId: string,
    status: "pending" | "in-progress" | "ready"
  ) => void;
  onItemStatusChange: (
    orderId: string,
    itemId: string,
    status: OrderItem["status"]
  ) => void;
  inProgress?: boolean;
  ready?: boolean;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  currentTime,
  onStatusChange,
  inProgress,
  ready,
}) => {
  // Live elapsed minutes since order was placed
  const liveElapsed = Math.floor(
    (currentTime.getTime() - order.orderTime.getTime()) / 1000 / 60
  );

  // Freeze elapsed time when the order first becomes ready (UI only, no backend change)
  const frozenElapsedRef = useRef<number | null>(null);

  if (order.status === "ready" && frozenElapsedRef.current === null) {
    frozenElapsedRef.current = liveElapsed; // capture the moment it turned ready
  }
  // If status were to revert (unlikely), allow re-freezing later
  if (order.status !== "ready" && frozenElapsedRef.current !== null) {
    frozenElapsedRef.current = null;
  }

  const elapsed = frozenElapsedRef.current ?? liveElapsed;
  const overdue = elapsed > order.estimatedTime;

  // Display rules:
  // - Pending / In Progress: show elapsed minutes counting UP
  // - Once elapsed exceeds estimate: show +Xmin (overdue)
  // - Ready: frozen elapsed at completion
  const displayTime = overdue
    ? `+${elapsed - order.estimatedTime}min`
    : `${elapsed}min`;

  const getTimeColorClass = () => {
    switch (order.status) {
      case "pending":
        return kitchenColors.status.pending.badge;
      case "in-progress":
        return kitchenColors.status.inProgress.badge;
      case "ready":
        return kitchenColors.status.ready.badge;
      default:
        return kitchenColors.status.pending.badge;
    }
  };

  const renderStatusButtons = () => {
    if (order.status === "pending") {
      return (
        <button
          onClick={() => onStatusChange(order.orderId, "in-progress")}
          className={`w-full ${kitchenColors.ui.button.primary} ${kitchenLayout.sizing.button.padding} rounded-lg font-semibold transition duration-300 flex items-center justify-center mt-auto ${kitchenLayout.typography.card.button}`}
        >
          <span
            className={`material-icons mr-2 ${kitchenLayout.sizing.icon.button}`}
          >
            play_arrow
          </span>
          Start Cooking
        </button>
      );
    }

    if (inProgress) {
      return (
        <div
          className={`flex flex-col md:flex-row ${kitchenLayout.spacing.buttonSpacing} mt-auto`}
        >
          <button
            onClick={() => onStatusChange(order.orderId, "pending")}
            className={`w-full md:w-1/2 ${kitchenColors.ui.button.secondary} ${kitchenLayout.sizing.button.padding} rounded-lg font-semibold transition duration-300 flex items-center justify-center ${kitchenLayout.typography.card.button}`}
          >
            <span
              className={`material-icons mr-2 ${kitchenLayout.sizing.icon.button}`}
            >
              pause
            </span>
            Pause
          </button>
          <button
            onClick={() => onStatusChange(order.orderId, "ready")}
            className={`w-full md:w-1/2 ${kitchenColors.status.ready.button} text-white ${kitchenColors.status.ready.hover} ${kitchenLayout.sizing.button.padding} rounded-lg font-semibold transition duration-300 flex items-center justify-center ${kitchenLayout.typography.card.button}`}
          >
            <span
              className={`material-icons mr-2 ${kitchenLayout.sizing.icon.button}`}
            >
              check
            </span>
            Mark Ready
          </button>
        </div>
      );
    }

    if (ready) {
      return (
        <button
          className={`w-full ${kitchenColors.ui.button.disabled} ${kitchenLayout.sizing.button.padding} rounded-lg font-semibold transition duration-300 mt-auto ${kitchenLayout.typography.card.button}`}
        >
          Ready for Pickup
        </button>
      );
    }

    return null;
  };

  return (
    <div
      className={`${kitchenColors.ui.layout.card} ${kitchenLayout.spacing.card} rounded-2xl h-full flex flex-col`}
    >
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <div className="min-w-0 flex-1 mr-3">
          <h3
            className={`${kitchenLayout.typography.card.title} ${kitchenColors.ui.primary.text} truncate`}
          >
            #{order.orderNumber}
          </h3>
          <p
            className={`${kitchenLayout.typography.card.subtitle} ${kitchenColors.ui.primary.textSecondary} truncate`}
          >
            {order.customerName}{" "}
            {order.tableNumber && `• Table ${order.tableNumber}`}
          </p>
        </div>
        <div
          className={`${getTimeColorClass()} ${
            kitchenLayout.typography.card.subtitle
          } font-medium ${
            kitchenLayout.sizing.button.paddingSmall
          } rounded-full flex items-center flex-shrink-0`}
        >
          <span
            className={`material-icons ${kitchenLayout.sizing.icon.small} mr-1`}
          >
            timer
          </span>
          {displayTime}
        </div>
      </div>

      <div className="mb-3 lg:mb-4 space-y-1 flex-1">
        {order.items.map((item) => {
          const isOrderReady = order.status === "ready";
          const badgeText = isOrderReady ? "ready" : item.status;
          const badgeClass = isOrderReady
            ? `${kitchenLayout.typography.card.subtitle} ${kitchenColors.status.ready.badge} px-2 py-0.5 rounded-full`
            : `${kitchenLayout.typography.card.subtitle} ${kitchenColors.status.pending.badge} px-2 py-0.5 rounded-full`;

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between ${kitchenColors.ui.primary.text}`}
            >
              <div className="truncate">
                {item.quantity}x {item.menuItem.name}
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className={badgeClass}>{badgeText}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 lg:mt-4">{renderStatusButtons()}</div>
    </div>
  );
};
