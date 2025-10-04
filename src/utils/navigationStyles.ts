/**
 * Navigation spacing utilities for consistent bottom padding
 * Ensures content is not hidden behind fixed bottom navigation bars
 */

// Bottom navigation heights (in pixels)
export const NAVIGATION_HEIGHTS = {
  // Standard mobile bottom navigation with py-2 + icon + text
  mobile: 60, // Typical height for icon + text + padding
  // Desktop typically doesn't need bottom padding as nav is in sidebar
  desktop: 0,
} as const;

// Tailwind padding classes that correspond to navigation heights
export const BOTTOM_PADDING_CLASSES = {
  // pb-20 = 80px, provides generous space for navigation
  mobile: 'pb-20',
  // No bottom padding needed on desktop (sidebar navigation)
  desktop: 'lg:pb-6',
  // Scroll padding for smooth scrolling behavior
  scrollPadding: 'scroll-pb-20 lg:scroll-pb-6',
} as const;

/**
 * Get the complete bottom padding classes for main content areas
 * that need to avoid being hidden behind bottom navigation
 */
export function getBottomNavigationPadding(): string {
  return `${BOTTOM_PADDING_CLASSES.mobile} ${BOTTOM_PADDING_CLASSES.desktop} ${BOTTOM_PADDING_CLASSES.scrollPadding}`;
}

/**
 * Get padding for fixed layout components (those using fixed inset-0)
 */
export function getFixedLayoutPadding(): string {
  return getBottomNavigationPadding();
}

/**
 * Check if element needs bottom navigation padding
 * Flexbox layouts typically handle this naturally
 */
export function needsBottomPadding(layoutType: 'fixed' | 'flexbox'): boolean {
  return layoutType === 'fixed';
}