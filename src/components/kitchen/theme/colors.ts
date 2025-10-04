// Color scheme configuration for Kitchen Display System (Updated to match Admin module)
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
      primary: "text-purple-600",
      background: "bg-purple-100",
      hover: "hover:bg-purple-600",
      button: "bg-purple-600",
      badge: "bg-purple-100 text-purple-600",
      icon: "text-purple-600",
      navActive: "text-purple-700 bg-purple-100",
      navHover: "hover:text-purple-600",
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
      hover: "hover:bg-gray-100",
      active: "bg-purple-100 border border-purple-200",
      border: "border-t border-gray-200",
    },
    button: {
      primary: "bg-purple-600 text-white hover:bg-purple-700",
      secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
      danger: "text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400",
      disabled: "bg-gray-700 text-white hover:bg-gray-800",
    },
    layout: {
      background: "bg-gray-50",
      card: "bg-white shadow-lg",
      header: "bg-purple-100",
      headerIcon: "text-purple-600",
    },
  },

  // Navigation colors
  navigation: {
    bottom: {
      background: "bg-white",
      border: "",
      text: "text-gray-600",
      hover: "hover:text-gray-900",
    },
  },
} as const;

export type KitchenColorScheme = typeof kitchenColors;
