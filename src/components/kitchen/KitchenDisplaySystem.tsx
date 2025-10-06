import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { OrderItem, MenuItem } from "../../types";

// Components
import { KitchenHeader } from "./components/KitchenHeader";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { BottomNavigation } from "./components/BottomNavigation";
import { OrderSection } from "./components/OrderSection";
import { KitchenMenu } from "./components/KitchenMenu";
import KitchenSettingsPage from "./components/KitchenSettingsPage";

// Theme
import { kitchenColors } from "./theme/colors";
import { kitchenLayout } from "./theme/layout";

const KitchenDisplaySystem: React.FC = () => {
  const { kitchenOrders, updateKitchenOrderStatus, updateOrderItemStatus, menuItems, updateMenuItem } =
    useApp();
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  // Hide top appbar(s) that may be rendered by a parent Layout.
  // We deliberately don't edit Layout — instead we hide any likely header elements
  // on mount and restore them on unmount so this view appears full-height.
  // IMPORTANT: skip any headers that are inside this component (rootRef) so we
  // don't accidentally hide our own header card.
  useEffect(() => {
    const selectors = [
      "header",
      "[data-topbar]",
      ".topbar",
      ".app-header",
      "#top-appbar",
    ];

    const found: { el: Element; prev: string | null }[] = [];

    selectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        // skip if the element is inside our component
        if (rootRef.current && rootRef.current.contains(el)) return;
        found.push({ el, prev: (el as HTMLElement).style.display || null });
        (el as HTMLElement).style.display = "none";
      }
    });

    return () => {
      // restore any hidden elements
      found.forEach(({ el, prev }) => {
        (el as HTMLElement).style.display = prev ?? "";
      });
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = (
    orderId: string,
    newStatus: "pending" | "in-progress" | "ready",
    paused?: boolean
  ) => {
    updateKitchenOrderStatus(orderId, newStatus, paused);
  };

  const handleItemStatusChange = (
    orderId: string,
    itemId: string,
    status: OrderItem["status"]
  ) => {
    updateOrderItemStatus(orderId, itemId, status);
  };

  const handleUpdateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    updateMenuItem(itemId, updates);
  };

  // Filter orders by status
  const pendingOrders = kitchenOrders.filter(
    (order) => order.status === "pending"
  );
  const inProgressOrders = kitchenOrders.filter(
    (order) => order.status === "in-progress"
  );
  const readyOrders = kitchenOrders.filter((order) => order.status === "ready");

  // UI filter state for navigation
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "pending" | "in-progress" | "ready" | "menu" | "settings"
  >("all");

  const handleFilterClick = (
    e: React.MouseEvent,
    filter: typeof selectedFilter
  ) => {
    e.preventDefault();
    // Always scroll to top when changing filters
    setSelectedFilter(filter);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  };

  // Scroll to top when filter changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [selectedFilter]);

  return (
    // Full-viewport container so the view truly fills the page
    <div
      ref={rootRef}
      className={`fixed inset-0 flex ${kitchenColors.ui.layout.background}`}
    >
      {/* Desktop Sidebar Navigation */}
      <SidebarNavigation
        selectedFilter={selectedFilter}
        onFilterClick={handleFilterClick}
        userName={user?.name}
        userRole={user?.role}
        onLogout={logout}
      />

      {/* Main Content */}
      <main
        ref={mainScrollRef}
        className={`flex-1 ${kitchenLayout.responsive.main.padding} min-h-screen ${kitchenLayout.responsive.main.margin} overflow-y-scroll kitchen-main ${kitchenLayout.responsive.main.paddingBottom}`}
      >
        <div className="w-full">
          {/* Sticky Kitchen Header */}
          <div className="sticky top-0 z-40 bg-transparent">
            <KitchenHeader
              currentTime={currentTime}
              totalOrders={pendingOrders.length + inProgressOrders.length}
              pendingCount={pendingOrders.length}
              inProgressCount={inProgressOrders.length}
              readyCount={readyOrders.length}
              onLogout={logout}
              title={selectedFilter === "menu" ? "Menu Management" : selectedFilter === "settings" ? "Settings" : "Kitchen Display System"}
              isSettings={selectedFilter === "settings"}
            />
          </div>

          {/* Content based on selected filter */}
          {selectedFilter === "menu" ? (
            <KitchenMenu
              menuItems={menuItems}
              onUpdateMenuItem={handleUpdateMenuItem}
            />
          ) : selectedFilter === "settings" ? (
            <KitchenSettingsPage />
          ) : (
            <>
              {/* Order Sections */}
              <div
                className={
                  selectedFilter === "all"
                    ? kitchenLayout.grid.main
                    : "w-full"
                }
              >
                {/* Pending Orders Section */}
                {(selectedFilter === "all" ||
                  selectedFilter === "pending") && (
                  <OrderSection
                    title="Pending"
                    icon="hourglass_top"
                    iconColorClass={kitchenColors.status.pending.icon}
                    orders={pendingOrders}
                    currentTime={currentTime}
                    onStatusChange={handleStatusChange}
                    onItemStatusChange={handleItemStatusChange}
                    selectedFilter={selectedFilter}
                    onViewAllClick={() => setSelectedFilter("pending")}
                    viewAllButtonColor={kitchenColors.status.pending.button}
                  />
                )}
                {(selectedFilter === "all" || selectedFilter === "in-progress") && (
                  <OrderSection
                    title="In Progress"
                    icon="autorenew"
                    iconColorClass={kitchenColors.status.inProgress.icon}
                    orders={inProgressOrders}
                    currentTime={currentTime}
                    onStatusChange={handleStatusChange}
                    onItemStatusChange={handleItemStatusChange}
                    selectedFilter={selectedFilter}
                    onViewAllClick={() => setSelectedFilter("in-progress")}
                    inProgress={true}
                    viewAllButtonColor={
                      kitchenColors.status.inProgress.button
                    }
                    viewAllButtonHover={kitchenColors.status.inProgress.hover}
                  />
                )}

                {/* Ready Orders Section */}
                {(selectedFilter === "all" || selectedFilter === "ready") && (
                  <OrderSection
                    title="Ready"
                    icon="check_circle"
                    iconColorClass={kitchenColors.status.ready.icon}
                    orders={readyOrders}
                    currentTime={currentTime}
                    onStatusChange={handleStatusChange}
                    onItemStatusChange={handleItemStatusChange}
                    selectedFilter={selectedFilter}
                    onViewAllClick={() => setSelectedFilter("ready")}
                    ready={true}
                    viewAllButtonColor={kitchenColors.status.ready.button}
                    viewAllButtonHover={kitchenColors.status.ready.hover}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation for Mobile and Tablet */}
      <BottomNavigation
        selectedFilter={selectedFilter}
        onFilterClick={handleFilterClick}
      />
    </div>
  );
};

export default KitchenDisplaySystem;
