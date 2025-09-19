import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { OrderItem } from "../../types";

// MenuItem interface
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  prepTime: number;
}

// Components
import { KitchenHeader } from "./components/KitchenHeader";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { BottomNavigation } from "./components/BottomNavigation";
import { OrderSection } from "./components/OrderSection";
import { KitchenMenu } from "./components/KitchenMenu";

// Theme
import { kitchenColors } from "./theme/colors";
import { kitchenLayout } from "./theme/layout";

const KitchenDisplaySystem: React.FC = () => {
  const { kitchenOrders, updateKitchenOrderStatus, updateOrderItemStatus } =
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
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  // Filter orders by status
  const pendingOrders = kitchenOrders.filter(
    (order) => order.status === "pending"
  );
  const inProgressOrders = kitchenOrders.filter(
    (order) => order.status === "in-progress"
  );
  const readyOrders = kitchenOrders.filter((order) => order.status === "ready");

  // Menu items state (should come from context in production)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Chicken Wings",
      description: "Spicy buffalo wings with ranch dressing",
      price: 12.99,
      category: "Appetizers",
      image:
        "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 15,
    },
    {
      id: "2",
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with parmesan and croutons",
      price: 9.99,
      category: "Appetizers",
      image:
        "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 10,
    },
    {
      id: "3",
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with seasonal vegetables",
      price: 24.99,
      category: "Main Course",
      image:
        "https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 25,
    },
    {
      id: "4",
      name: "Beef Steak",
      description: "Premium ribeye steak cooked to perfection",
      price: 32.99,
      category: "Main Course",
      image:
        "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: false,
      prepTime: 30,
    },
    {
      id: "5",
      name: "Chocolate Cake",
      description: "Rich chocolate cake with vanilla ice cream",
      price: 7.99,
      category: "Desserts",
      image:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 5,
    },
    {
      id: "6",
      name: "Fresh Juice",
      description: "Freshly squeezed orange juice",
      price: 4.99,
      category: "Beverages",
      image:
        "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 3,
    },
  ]);

  // UI filter state for navigation
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "pending" | "in-progress" | "ready" | "menu"
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
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1200px] px-4">
            {/* Sticky Kitchen Header */}
            <div className="sticky top-0 z-40 bg-transparent">
              <KitchenHeader
                currentTime={currentTime}
                totalOrders={kitchenOrders.length}
                pendingCount={pendingOrders.length}
                inProgressCount={inProgressOrders.length}
                readyCount={readyOrders.length}
                onLogout={logout}
              />
            </div>

            {/* Content based on selected filter */}
            {selectedFilter === "menu" ? (
              <KitchenMenu
                menuItems={menuItems}
                onUpdateMenuItem={handleUpdateMenuItem}
              />
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
                      viewAllButtonHover={kitchenColors.status.pending.hover}
                    />
                  )}

                  {/* In Progress Orders Section */}
                  {(selectedFilter === "all" ||
                    selectedFilter === "in-progress") && (
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
