import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ActiveNotification } from '../content';
import { color, font, radius, shadow, space, tap } from '../theme/tokens';

/**
 * In-app banner styled like a push notification. The store owns the single slot
 * — a new day assigns over whatever was showing, so stepping quickly through
 * days can never stack banners.
 *
 * Tapping it deep-links: `openNotification()` clears the slot and hands back the
 * tab to navigate to, so the destination stays on the data rather than being
 * inferred from the copy here.
 */
export function NotificationBanner({
  notification,
  onOpen,
  onDismiss,
}: {
  notification: ActiveNotification;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  return (
    <View style={[styles.banner, shadow.card]} accessibilityLiveRegion="polite">
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <Text style={styles.app}>cyncd</Text>
        <Text style={styles.text}>{notification.text}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onDismiss}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <Svg width={14} height={14} viewBox="0 0 16 16">
          <Path
            d="M4 4l8 8M12 4l-8 8"
            stroke={color.inkSoft}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    paddingLeft: space.lg,
    paddingRight: space.sm,
    paddingVertical: space.md,
    gap: space.sm,
  },
  body: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  app: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: color.inkFaint,
  },
  text: {
    fontSize: font.size.small,
    lineHeight: 20,
    color: color.ink,
  },
  close: {
    width: tap,
    height: tap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
