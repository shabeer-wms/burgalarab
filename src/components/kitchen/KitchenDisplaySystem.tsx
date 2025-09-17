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
      // restore previous display values
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
    setSelectedFilter(filter);
  };

  return (
    // full-viewport container so the view truly fills the page
    <div ref={rootRef} className="fixed inset-0 flex bg-gray-100">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex flex-col">
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
        <div className="p-4 border-t">
          <div className="mb-4 flex items-center">
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
            className="w-full flex items-center justify-center px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white"
          >
            <span className="material-icons mr-2">logout</span>
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6 min-h-screen ml-0 md:ml-64 overflow-auto">
        <div className="w-full">
          <header className="bg-white p-6 rounded-2xl shadow-md mb-8 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-xl mr-4">
                <span
                  className="material-icons text-blue-500"
                  style={{ fontSize: "32px" }}
                >
                  kitchen
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Kitchen Display System
                </h1>
                <p className="text-gray-500">
                  {currentTime.toLocaleTimeString()} | {kitchenOrders.length}{" "}
                  Active Orders
                </p>
              </div>
            </div>
            <div className="flex space-x-8 text-center">
              <div>
                <p className="text-3xl font-bold text-yellow-500">
                  {pendingOrders.length}
                </p>
                <p className="text-gray-500">Pending</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-500">
                  {inProgressOrders.length}
                </p>
                <p className="text-gray-500">In Progress</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-500">
                  {readyOrders.length}
                </p>
                <p className="text-gray-500">Ready</p>
              </div>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedFilter === "all" || selectedFilter === "pending") && (
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="material-icons text-yellow-500 mr-2">
                    warning
                  </span>
                  Pending ({pendingOrders.length})
                </h2>
                <div className="space-y-6">
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
              </section>
            )}

            {(selectedFilter === "all" || selectedFilter === "in-progress") && (
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="material-icons text-blue-500 mr-2">
                    play_arrow
                  </span>
                  In Progress ({inProgressOrders.length})
                </h2>
                <div className="space-y-6">
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
                <div className="space-y-6">
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
              </section>
            )}
          </div>
        </div>
      </main>
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
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500">
            {order.customerName}{" "}
            {order.tableNumber && `• Table ${order.tableNumber}`}
          </p>
        </div>
        <div
          className={`${timeColorClass} text-sm font-medium px-3 py-1 rounded-full flex items-center`}
        >
          <span className="material-icons text-xs mr-1">timer</span>
          {displayTime}
        </div>
      </div>
      <div className="mb-4 space-y-1">
        {order.items.map((item) => (
          <p key={item.id} className="text-gray-700">
            {item.quantity}x {item.menuItem.name}{" "}
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
              {item.status}
            </span>
          </p>
        ))}
      </div>
      {order.status === "pending" && (
        <button
          onClick={() => onStatusChange(order.orderId, "in-progress")}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 flex items-center justify-center"
        >
          <span className="material-icons mr-2">play_arrow</span>
          Start Cooking
        </button>
      )}
      {inProgress && (
        <div className="flex space-x-4">
          <button
            onClick={() => onStatusChange(order.orderId, "pending")}
            className="w-1/2 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-300 flex items-center justify-center"
          >
            <span className="material-icons mr-2">pause</span>
            Pause
          </button>
          <button
            onClick={() => onStatusChange(order.orderId, "ready")}
            className="w-1/2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 flex items-center justify-center"
          >
            <span className="material-icons mr-2">check</span>
            Mark Ready
          </button>
        </div>
      )}
      {ready && (
        <button className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-300">
          Ready for Pickup
        </button>
      )}
    </div>
  );
};

export default KitchenDisplaySystem;
