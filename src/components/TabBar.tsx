import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { tabsForRole, type Role, type TabId } from '../content';
import { color, font, space } from '../theme/tokens';

const ICONS: Record<TabId, ReactNode> = {
  today: (
    <>
      <Circle cx={12} cy={12} r={4.2} />
      <Path d="M12 2.6v2.2M12 19.2v2.2M4.4 12H2.2M21.8 12h-2.2M6.6 6.6 5 5M19 19l-1.6-1.6M17.4 6.6 19 5M5 19l1.6-1.6" />
    </>
  ),
  forecast: (
    <>
      <Path d="M4 17.5 9.2 12l3.4 3.2L20 7.5" />
      <Path d="M16.5 7.5H20v3.5" />
    </>
  ),
  partner: (
    <>
      <Circle cx={9} cy={8.4} r={3.2} />
      <Circle cx={16.6} cy={9.6} r={2.4} />
      <Path d="M3.4 19.4c0-3.1 2.5-5.2 5.6-5.2s5.6 2.1 5.6 5.2M16.2 14.4c2.5.2 4.4 2.1 4.4 5" />
    </>
  ),
  plan: (
    <>
      <Rect x={3.4} y={5} width={17.2} height={15.6} rx={3.2} />
      <Path d="M3.4 9.8h17.2M8.2 2.8v3.6M15.8 2.8v3.6" />
    </>
  ),
  reflect: (
    <Path d="M12 20.4s-7.4-4.3-7.4-9.3a4.2 4.2 0 0 1 7.4-2.7 4.2 4.2 0 0 1 7.4 2.7c0 5-7.4 9.3-7.4 9.3Z" />
  ),
};

/**
 * Bottom tab bar, shared by every post-onboarding screen.
 *
 * Tabs are 56px tall so every target clears 44px comfortably, and the bar pads
 * itself by the bottom safe-area inset so it sits above the home indicator —
 * the native equivalent of the web build's `env(safe-area-inset-bottom)`.
 */
export function TabBar({
  active,
  role,
  onValueChange,
}: {
  active: TabId;
  role: Role;
  onValueChange: (tab: TabId) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: insets.bottom }]}
    >
      {tabsForRole(role).map((tab) => {
        const current = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: current }}
            accessibilityLabel={tab.label}
            // The tab id, so anything checking which tab is open reads the id
            // rather than inferring it from the label. Renaming a label should
            // not change what a deep link is understood to have done.
            testID={`tab-${tab.id}`}
            onPress={() => onValueChange(tab.id)}
            style={styles.tab}
          >
            <Svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke={current ? color.sageDeep : color.inkFaint}
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONS[tab.id]}
            </Svg>
            <Text style={[styles.label, current && styles.labelCurrent]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: color.line,
    backgroundColor: color.surface,
  },
  tab: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: font.weight.semibold,
    color: color.inkFaint,
  },
  labelCurrent: {
    color: color.sageDeep,
  },
});
