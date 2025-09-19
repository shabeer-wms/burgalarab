// Color scheme configuration for Kitchen Display System
export const kitchenColors = {
  // Status colors
  status: {
    pending: {
      primary: "text-yellow-500",
      background: "bg-yellow-100",
      hover: "hover:bg-yellow-600",
      button: "bg-yellow-500",
      badge: "bg-yellow-200 text-yellow-800",
      icon: "text-yellow-500",
      navActive: "text-yellow-500 bg-yellow-50",
      navHover: "hover:text-yellow-500",
    },
    inProgress: {
      primary: "text-blue-500",
      background: "bg-blue-100",
      hover: "hover:bg-blue-600",
      button: "bg-blue-500",
      badge: "bg-blue-100 text-blue-600",
      icon: "text-blue-500",
      navActive: "text-blue-500 bg-blue-50",
      navHover: "hover:text-blue-500",
    },
    ready: {
      primary: "text-green-500",
      background: "bg-green-100",
      hover: "hover:bg-green-600",
      button: "bg-green-500",
      badge: "bg-green-200 text-green-800",
      icon: "text-green-500",
      navActive: "text-green-500 bg-green-50",
      navHover: "hover:text-green-500",
    },
  },

  // UI colors
  ui: {
    primary: {
      background: "bg-white",
      text: "text-gray-800",
      textSecondary: "text-gray-500",
      border: "border-gray-200",
      hover: "hover:bg-gray-50",
    },
    sidebar: {
      background: "bg-white",
      text: "text-gray-700",
      hover: "hover:bg-gray-200",
      active: "bg-blue-100",
      border: "border-t",
    },
    button: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
      danger: "text-red-500 border-red-500 hover:bg-red-500 hover:text-white",
      disabled: "bg-gray-700 text-white hover:bg-gray-800",
    },
    layout: {
      background: "bg-gray-100",
      card: "bg-white shadow-md",
      header: "bg-blue-100",
      headerIcon: "text-blue-500",
    },
  },

  // Navigation colors
  navigation: {
    bottom: {
      background: "bg-white",
      border: "border-t border-gray-200",
      text: "text-gray-600",
      hover: "hover:bg-gray-50",
    },
  },
} as const;

export type KitchenColorScheme = typeof kitchenColors;
