import type { ReactNode } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { color, font, radius, shadow, space, tap } from '../theme/tokens'

/**
 * The handful of shapes the web prototype expressed as CSS classes — `.card`,
 * `.btn`, `.eyebrow`, `.guidance` and friends.
 *
 * They live here rather than in each screen because they were shared in the
 * stylesheet and should stay shared: the alternative is eight screens each
 * re-deriving what a card looks like, which is how a design system quietly
 * becomes eight design systems.
 */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>
}

export function ScreenTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.screenTitle}>{children}</Text>
}

/** The one guidance sentence. The largest text on any screen, deliberately. */
export function Guidance({ children }: { children: ReactNode }) {
  return <Text style={styles.guidance}>{children}</Text>
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>
}

export function Faint({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.faint, style]}>{children}</Text>
}

/** Placeholder copy for a list with nothing in it yet. Never a scold. */
export function Empty({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.empty, style]}>
      <Text style={styles.emptyText}>{children}</Text>
    </View>
  )
}

export function Card({
  children,
  variant = 'raised',
  style,
}: {
  children: ReactNode
  variant?: 'raised' | 'flat' | 'warm'
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View
      style={[
        styles.card,
        variant === 'raised' && shadow.card,
        variant === 'flat' && styles.cardFlat,
        variant === 'warm' && styles.cardWarm,
        style,
      ]}
    >
      {children}
    </View>
  )
}

/** A row with its children pushed to either end — the pill-beside-a-label shape. */
export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export function Btn({
  label,
  onPress,
  variant = 'primary',
  block = false,
  disabled = false,
  style,
}: {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  block?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      // The web build leaned on `:active`; RN gives the pressed state per press,
      // so the dip is applied inline rather than as a style rule.
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'secondary' && styles.btnSecondary,
        variant === 'ghost' && styles.btnGhost,
        block && styles.btnBlock,
        pressed && styles.btnPressed,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.btnLabel,
          variant === 'primary' && styles.btnLabelPrimary,
          variant === 'ghost' && styles.btnLabelGhost,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

/** Tap-to-answer / filter chip. `selected` drives the pressed-in look. */
export function Chip({
  label,
  onPress,
  selected = false,
  style,
}: {
  label: string
  onPress: () => void
  selected?: boolean
  style?: StyleProp<ViewStyle>
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.btnPressed,
        style,
      ]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: color.inkFaint,
  },
  screenTitle: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    letterSpacing: -0.2,
    color: color.ink,
  },
  guidance: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  muted: {
    fontSize: font.size.body,
    lineHeight: 24,
    color: color.inkSoft,
  },
  faint: {
    fontSize: font.size.small,
    lineHeight: 20,
    color: color.inkFaint,
  },
  empty: {
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
    backgroundColor: color.surfaceWarm,
  },
  emptyText: {
    fontSize: font.size.small,
    lineHeight: 20,
    color: color.inkSoft,
    textAlign: 'center',
  },
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.card,
    backgroundColor: color.surface,
  },
  cardFlat: {
    backgroundColor: color.surfaceWarm,
  },
  cardWarm: {
    backgroundColor: color.sand,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    minHeight: tap,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBlock: {
    alignSelf: 'stretch',
  },
  btnPrimary: {
    backgroundColor: color.sageDeep,
  },
  btnSecondary: {
    backgroundColor: color.surfaceWarm,
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnPressed: {
    opacity: 0.72,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnLabel: {
    fontSize: font.size.body,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  btnLabelPrimary: {
    color: color.surface,
  },
  btnLabelGhost: {
    color: color.inkSoft,
  },
  chip: {
    minHeight: tap,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: color.sage,
    borderColor: color.sageDeep,
  },
  chipLabel: {
    fontSize: font.size.small,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  chipLabelSelected: {
    color: color.surface,
  },
})

export { styles as uiStyles }
