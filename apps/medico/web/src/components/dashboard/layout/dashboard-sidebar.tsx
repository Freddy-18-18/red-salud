// TODO: This file provides the MenuGroup type for backward compatibility.
// The actual sidebar component is at @/components/dashboard/sidebar.tsx

export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  color?: string;
}

export interface MenuGroup {
  label: string;
  icon?: string;
  items: Record<string, unknown>[];
}
