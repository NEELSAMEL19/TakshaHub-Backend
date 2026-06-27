
export interface MenuItem {
  id: string;
  label: string;
  path: string;
  module: string | null;
  feature: string | null;
  group: string;
}

// Strict type — group -> itemId -> label
export type SidebarResponse = Record<string, Record<string, string>>;