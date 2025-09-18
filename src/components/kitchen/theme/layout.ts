// Layout configuration for Kitchen Display System
export const kitchenLayout = {
  // Responsive breakpoints and sizing
  responsive: {
    sidebar: {
      width: "w-64",
      hidden: "hidden lg:flex",
      position: "fixed left-0 top-0 bottom-0",
    },
    main: {
      padding: "p-4 md:p-6",
      margin: "ml-0 lg:ml-64",
      paddingBottom: "pb-24 lg:pb-6",
    },
    header: {
      padding: "p-4 md:p-5 lg:p-6",
      margin: "mb-6 lg:mb-8",
      minHeight: "md:min-h-[88px]",
    },
    bottomNav: {
      height: "h-14 md:h-16",
      hidden: "lg:hidden",
      position: "fixed bottom-0 left-0 right-0",
    },
  },

  // Grid configurations
  grid: {
    main: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
    statusCounters: {
      mobile: "repeat(auto-fit, minmax(70px, 1fr))",
      desktop: "lg:flex lg:items-center lg:gap-6 lg:justify-end",
    },
  },

  // Spacing
  spacing: {
    card: "p-4 md:p-5 lg:p-6",
    section: "space-y-4 lg:space-y-6",
    navigation: "space-y-2",
    statusGaps: "gap-2 sm:gap-3",
    buttonSpacing: "space-y-2 md:space-y-0 md:space-x-3 lg:space-x-4",
  },

  // Typography
  typography: {
    header: {
      title: "text-lg md:text-xl lg:text-2xl font-bold",
      subtitle: "text-xs md:text-sm",
      counters: {
        mobile: "text-sm sm:text-base md:text-lg font-bold",
        desktop: "text-3xl font-bold",
      },
    },
    card: {
      title: "text-base md:text-lg font-bold",
      subtitle: "text-sm",
      button: "text-sm md:text-base",
    },
    navigation: {
      sidebar: "text-lg",
      bottom: "text-sm md:text-base",
    },
    counters: {
      mobile: "text-[10px] sm:text-[11px] md:text-xs",
      desktop: "text-sm",
    },
  },

  // Component sizing
  sizing: {
    icon: {
      header: "w-10 h-10 md:w-11 lg:w-12 md:h-11 lg:h-12",
      navigation: "text-lg",
      button: "text-base",
      small: "text-xs",
      user: "text-xl",
    },
    button: {
      padding: "py-2.5 md:py-3 px-4",
      paddingSmall: "px-2 md:px-3 py-1",
      nav: "px-4 py-2",
      navBottom: "space-y-0.5 md:space-y-1",
    },
    counter: {
      width: "w-6 sm:w-8",
      widthDesktop: "w-12",
    },
  },
} as const;

export type KitchenLayoutConfig = typeof kitchenLayout;
