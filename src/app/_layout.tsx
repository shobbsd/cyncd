import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CyncdProvider } from '../state';
import { color } from '../theme/tokens';

/**
 * Root layout: providers and nothing else.
 *
 * There is deliberately one route. Which screen shows is `state.flow`, which is
 * persisted — a linear onboarding flow plus four tabs does not need a router,
 * and keeping it in state is what lets a notification deep-link be a single
 * `setTab` call rather than a navigation graph. See `src/app/index.tsx`.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CyncdProvider>
        {/* The palette is warm and fixed; a dark scheme would be a second
            design system, so the status bar is pinned dark-on-light. */}
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: color.bg },
          }}
        />
      </CyncdProvider>
    </SafeAreaProvider>
  );
}
