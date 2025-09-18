import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { KitchenDisplayItem, OrderItem } from "../../types";

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
    newStatus: "pending" | "in-progress" | "ready"
  ) => {
    updateKitchenOrderStatus(orderId, newStatus);
  };

  const handleItemStatusChange = (
    orderId: string,
    itemId: string,
    status: OrderItem["status"]
  ) => {
    updateOrderItemStatus(orderId, itemId, status);
  };

  const pendingOrders = kitchenOrders.filter(
    (order) => order.status === "pending"
  );
  const inProgressOrders = kitchenOrders.filter(
    (order) => order.status === "in-progress"
  );
  const readyOrders = kitchenOrders.filter((order) => order.status === "ready");

  // UI filter state for left navigation
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "pending" | "in-progress" | "ready"
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
    // full-viewport container so the view truly fills the page
    <div ref={rootRef} className="fixed inset-0 flex bg-gray-100">
      {/* Desktop sidebar (hidden on small screens) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex-col">
        {/* hide sidebar on small screens to improve responsiveness */}
        <div className="p-6 text-lg text-gray-800 border-b hidden md:block">
          <p className="font-bold">Hotel Management</p>
          <p className="text-base">Kitchen Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <a
            href="#"
            onClick={(e) => handleFilterClick(e, "all")}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectedFilter === "all"
                ? "text-gray-700 bg-blue-100"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="material-icons mr-3">apps</span>
            All
          </a>
          <a
            href="#"
            onClick={(e) => handleFilterClick(e, "pending")}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectedFilter === "pending"
                ? "text-gray-700 bg-yellow-100"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="material-icons mr-3">hourglass_top</span>
            Pending
          </a>
          <a
            href="#"
            onClick={(e) => handleFilterClick(e, "in-progress")}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectedFilter === "in-progress"
                ? "text-gray-700 bg-blue-100"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="material-icons mr-3">autorenew</span>
            In Progress
          </a>
          <a
            href="#"
            onClick={(e) => handleFilterClick(e, "ready")}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectedFilter === "ready"
                ? "text-gray-700 bg-green-100"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="material-icons mr-3">check_circle_outline</span>
            Ready
          </a>
        </nav>
        <div className="p-4 border-t md:flex md:flex-col md:justify-start">
          <div className="mb-3 flex items-center md:mb-0">
            <span className="material-icons mr-3 text-gray-500">
              account_circle
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "Unknown"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white md:mt-4"
          >
            <span className="material-icons mr-2">logout</span>
            Logout
          </button>
        </div>
      </aside>
      <main
        ref={mainScrollRef}
        className="flex-1 p-4 md:p-6 min-h-screen ml-0 md:ml-64 overflow-y-scroll kitchen-main pb-24 md:pb-6"
      >
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[1200px] px-4">
            <header className="bg-white p-4 md:p-6 rounded-2xl shadow-md mb-8 md:min-h-[88px]">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                <div className="flex items-center w-full md:w-auto justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="bg-blue-100 w-10 h-10 md:w-12 md:h-12 rounded-xl mr-3 flex-shrink-0 flex items-center justify-center">
                      <span
                        className="material-icons text-blue-500"
                        style={{ fontSize: 18 }}
                      >
                        kitchen
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                        Kitchen Display System
                      </h1>
                      <p className="text-gray-500 text-xs md:text-sm tabular-nums truncate">
                        {currentTime.toLocaleTimeString()} |{" "}
                        {kitchenOrders.length} Active Orders
                      </p>
                    </div>
                  </div>

                  {/* Logout button for small screens */}
                  <button
                    onClick={logout}
                    className="md:hidden ml-2 p-2 rounded-md text-red-500 hover:bg-red-50 flex items-center flex-shrink-0"
                    aria-label="Logout"
                  >
                    <span className="material-icons text-lg">logout</span>
                  </button>
                </div>

                <div className="w-full md:w-96">
                  {/* small screens: adaptive auto-fit grid */}
                  <div
                    className="grid gap-2 sm:gap-3 w-full md:hidden"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(70px, 1fr))",
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <p className="text-sm sm:text-base md:text-lg font-bold text-yellow-500 w-6 sm:w-8 text-center">
                        {pendingOrders.length}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs">
                        Pending
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm sm:text-base md:text-lg font-bold text-blue-500 w-6 sm:w-8 text-center">
                        {inProgressOrders.length}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs whitespace-nowrap">
                        In Progress
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm sm:text-base md:text-lg font-bold text-green-500 w-6 sm:w-8 text-center">
                        {readyOrders.length}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs">
                        Ready
                      </p>
                    </div>
                  </div>

                  {/* md+ screens: force horizontal stacked counters */}
                  <div className="hidden md:flex md:items-center md:gap-6 md:justify-end">
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-yellow-500 w-12 text-center tabular-nums">
                        {pendingOrders.length}
                      </p>
                      <p className="text-gray-500 text-sm">Pending</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-blue-500 w-12 text-center tabular-nums">
                        {inProgressOrders.length}
                      </p>
                      <p className="text-gray-500 text-sm">In Progress</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-green-500 w-12 text-center tabular-nums">
                        {readyOrders.length}
                      </p>
                      <p className="text-gray-500 text-sm">Ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            {/* If 'all' is selected, use the multi-column layout; otherwise use a single full-width column */}
            <div
              className={
                selectedFilter === "all"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "w-full"
              }
            >
              {(selectedFilter === "all" || selectedFilter === "pending") && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="material-icons text-yellow-500 mr-2">
                      warning
                    </span>
                    Pending ({pendingOrders.length})
                  </h2>
                  {selectedFilter === "all" ? (
                    <div className="space-y-6">
                      {pendingOrders.slice(0, 4).map((order) => (
                        <KitchenOrderCard
                          key={order.orderId}
                          order={order}
                          currentTime={currentTime}
                          onStatusChange={handleStatusChange}
                          onItemStatusChange={handleItemStatusChange}
                        />
                      ))}

                      {pendingOrders.length > 4 && (
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFilter("pending");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full shadow hover:bg-yellow-600 transition"
                          >
                            <span className="material-icons text-sm">
                              visibility
                            </span>
                            View All Pending
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {pendingOrders.map((order) => (
                        <KitchenOrderCard
                          key={order.orderId}
                          order={order}
                          currentTime={currentTime}
                          onStatusChange={handleStatusChange}
                          onItemStatusChange={handleItemStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {(selectedFilter === "all" ||
                selectedFilter === "in-progress") && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="material-icons text-blue-500 mr-2">
                      play_arrow
                    </span>
                    In Progress ({inProgressOrders.length})
                  </h2>
                  {selectedFilter === "all" ? (
                    <div className="space-y-6">
                      {inProgressOrders.slice(0, 4).map((order) => (
                        <KitchenOrderCard
                          key={order.orderId}
                          order={order}
                          currentTime={currentTime}
                          onStatusChange={handleStatusChange}
                          onItemStatusChange={handleItemStatusChange}
                          inProgress
                        />
                      ))}

                      {inProgressOrders.length > 4 && (
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFilter("in-progress");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
                          >
                            <span className="material-icons text-sm">
                              visibility
                            </span>
                            View All In Progress
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {inProgressOrders.map((order) => (
                        <KitchenOrderCard
                          key={order.orderId}
                          order={order}
                          currentTime={currentTime}
                          onStatusChange={handleStatusChange}
                          onItemStatusChange={handleItemStatusChange}
                          inProgress
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {(selectedFilter === "all" || selectedFilter === "ready") && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="material-icons text-green-500 mr-2">
                      check_circle
                    </span>
                    Ready ({readyOrders.length})
                  </h2>
                  {selectedFilter === "all" ? (
                    <div className="space-y-6">
                      {readyOrders.slice(0, 4).map((order) => (
                        <KitchenOrderCard
                          key={order.orderId}
                          order={order}
                          currentTime={currentTime}
                          onStatusChange={handleStatusChange}
                          onItemStatusChange={handleItemStatusChange}
                          ready
                        />
                      ))}

                      {readyOrders.length > 4 && (
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFilter("ready");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition"
                          >
                            <span className="material-icons text-sm">
                              visibility
                            </span>
                            View All Ready
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {readyOrders.map((order) => (
                        <KitchenOrderCard
                          key={order.orderId}
                          order={order}
                          currentTime={currentTime}
                          onStatusChange={handleStatusChange}
                          onItemStatusChange={handleItemStatusChange}
                          ready
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for small screens */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={(e) => handleFilterClick(e, "all")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              selectedFilter === "all"
                ? "text-blue-500 bg-blue-50"
                : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            <span className="material-icons text-sm">apps</span>
            <span className="text-xs font-medium">All</span>
          </button>
          <button
            onClick={(e) => handleFilterClick(e, "pending")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              selectedFilter === "pending"
                ? "text-yellow-500 bg-yellow-50"
                : "text-gray-600 hover:text-yellow-500 hover:bg-gray-50"
            }`}
          >
            <span className="material-icons text-sm">hourglass_top</span>
            <span className="text-xs font-medium">Pending</span>
          </button>
          <button
            onClick={(e) => handleFilterClick(e, "in-progress")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              selectedFilter === "in-progress"
                ? "text-blue-500 bg-blue-50"
                : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            <span className="material-icons text-sm">autorenew</span>
            <span className="text-xs font-medium">In Progress</span>
          </button>
          <button
            onClick={(e) => handleFilterClick(e, "ready")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              selectedFilter === "ready"
                ? "text-green-500 bg-green-50"
                : "text-gray-600 hover:text-green-500 hover:bg-gray-50"
            }`}
          >
            <span className="material-icons text-sm">check_circle_outline</span>
            <span className="text-xs font-medium">Ready</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

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

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
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

  const timeColorClass =
    order.status === "pending"
      ? "bg-yellow-100 text-yellow-600"
      : order.status === "in-progress"
      ? "bg-blue-100 text-blue-600"
      : "bg-green-100 text-green-600";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">
            #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {order.customerName}{" "}
            {order.tableNumber && `• Table ${order.tableNumber}`}
          </p>
        </div>
        <div
          className={`${timeColorClass} text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full flex items-center flex-shrink-0`}
        >
          <span className="material-icons text-xs mr-1">timer</span>
          {displayTime}
        </div>
      </div>
      <div className="mb-4 space-y-1 flex-1">
        {order.items.map((item) => {
          const isOrderReady = order.status === "ready";
          const badgeText = isOrderReady ? "ready" : item.status;
          const badgeClass = isOrderReady
            ? "text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full"
            : "text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full";

          return (
            <div
              key={item.id}
              className="flex items-center justify-between text-gray-700"
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
      <div className="mt-4">
        {order.status === "pending" && (
          <button
            onClick={() => onStatusChange(order.orderId, "in-progress")}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 flex items-center justify-center mt-auto text-sm sm:text-base"
          >
            <span className="material-icons mr-2 text-base">play_arrow</span>
            Start Cooking
          </button>
        )}

        {inProgress && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-auto">
            <button
              onClick={() => onStatusChange(order.orderId, "pending")}
              className="w-full sm:w-1/2 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition duration-300 flex items-center justify-center text-sm sm:text-base"
            >
              <span className="material-icons mr-2 text-base">pause</span>
              Pause
            </button>
            <button
              onClick={() => onStatusChange(order.orderId, "ready")}
              className="w-full sm:w-1/2 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition duration-300 flex items-center justify-center text-sm sm:text-base"
            >
              <span className="material-icons mr-2 text-base">check</span>
              Mark Ready
            </button>
          </div>
        )}

        {ready && (
          <button className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition duration-300 mt-auto text-sm sm:text-base">
            Ready for Pickup
          </button>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplaySystem;
