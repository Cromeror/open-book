/**
 * Shared constants for the web application
 */

/**
 * Icon mapping from icon names to emoji representations
 * Used throughout the application for displaying module icons
 */
export const ICON_MAP: Record<string, string> = {
  Target: '🎯',
  Users: '👥',
  Building: '🏢',
  Home: '🏠',
  Calendar: '📅',
  HandHeart: '🤝',
  DollarSign: '💰',
  MessageSquare: '💬',
  BarChart: '📊',
  History: '📜',
  Bell: '🔔',
  Settings: '⚙️',
};

/**
 * List of available icon names for selection in forms
 */
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

/**
 * Get emoji for an icon name, with fallback
 */
export function getIconEmoji(iconName?: string | null): string {
  if (!iconName) return '📦';
  return ICON_MAP[iconName] || '📦';
}
