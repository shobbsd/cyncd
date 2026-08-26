import type { Role, TabId } from './types';

export interface AppTab {
  id: TabId;
  label: string;
}

const SHARED_TABS: AppTab[] = [
  { id: 'today', label: 'Today' },
  { id: 'partner', label: 'Partner' },
  { id: 'plan', label: 'Plan' },
  { id: 'reflect', label: 'Reflect' },
];

const HER_TABS: AppTab[] = [
  SHARED_TABS[0],
  { id: 'forecast', label: 'Forecast' },
  ...SHARED_TABS.slice(1),
];

export function tabsForRole(role: Role): AppTab[] {
  return role === 'shanice' ? HER_TABS : SHARED_TABS;
}

export function tabForRole(role: Role, tab: TabId): TabId | null {
  return tabsForRole(role).some(({ id }) => id === tab) ? tab : null;
}
