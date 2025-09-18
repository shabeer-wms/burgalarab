import React from "react";
import { KitchenDisplayItem, OrderItem } from "../../../types";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface OrderSectionProps {
  title: string;
  icon: string;
  iconColorClass: string;
  orders: KitchenDisplayItem[];
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
  selectedFilter: "all" | "pending" | "in-progress" | "ready";
  onViewAllClick?: () => void;
  inProgress?: boolean;
  ready?: boolean;
  viewAllButtonColor?: string;
  viewAllButtonHover?: string;
}

export const OrderSection: React.FC<OrderSectionProps> = ({
  title,
  icon,
  iconColorClass,
  orders,
  currentTime,
  onStatusChange,
  onItemStatusChange,
  selectedFilter,
  onViewAllClick,
  inProgress,
  ready,
  viewAllButtonColor = "bg-blue-500",
  viewAllButtonHover = "hover:bg-blue-600",
}) => {
  const isAllView = selectedFilter === "all";
  const displayOrders = isAllView ? orders.slice(0, 4) : orders;
  const showViewAllButton = isAllView && orders.length > 4 && onViewAllClick;

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${kitchenColors.ui.primary.text} mb-4 flex items-center`}
      >
        <span className={`material-icons ${iconColorClass} mr-2`}>{icon}</span>
        {title} ({orders.length})
      </h2>

      {isAllView ? (
        <div className={kitchenLayout.spacing.section}>
          {displayOrders.map((order) => (
            <KitchenOrderCard
              key={order.orderId}
              order={order}
              currentTime={currentTime}
              onStatusChange={onStatusChange}
              onItemStatusChange={onItemStatusChange}
              inProgress={inProgress}
              ready={ready}
            />
          ))}

          {showViewAllButton && (
            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onViewAllClick!();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 ${viewAllButtonColor} text-white rounded-full shadow ${viewAllButtonHover} transition`}
              >
                <span className="material-icons text-sm">visibility</span>
                View All {title}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`${kitchenLayout.grid.main} w-full`}>
          {displayOrders.map((order) => (
            <KitchenOrderCard
              key={order.orderId}
              order={order}
              currentTime={currentTime}
              onStatusChange={onStatusChange}
              onItemStatusChange={onItemStatusChange}
              inProgress={inProgress}
              ready={ready}
            />
          ))}
        </div>
      )}
    </section>
  );
};
