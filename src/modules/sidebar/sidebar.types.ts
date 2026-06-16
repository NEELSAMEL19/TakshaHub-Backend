export interface MenuItem {
  id: string;
  label: string;
  path: string;
  module: string | null;
  feature: string | null;
  group: string;
}

export interface SidebarResponse {
  [group: string]: {
    [key: string]: string;
  };
}
