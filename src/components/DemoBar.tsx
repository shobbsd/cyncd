import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ROLE_LABELS, type Role } from '../content'
import { color, font, radius, shadow, space, tap } from '../theme/tokens'

/** Object key order is the display order: primary user first. */
const ROLES = Object.keys(ROLE_LABELS) as Role[]

/**
 * Demo-only controls. Discreet and collapsible, top corner, above everything
 * else — it is a presenter's tool, not part of the product.
 *
 * Role toggle, day stepper and reset. Nothing here is meant to survive into a
 * real build; when the app gets real accounts and a real calendar this file is
 * the first thing to delete.
 */
export function DemoBar({
  role,
  date,
  onRole,
  onStep,
  onReset,
}: {
  role: Role
  date: string
  onRole: (role: Role) => void
  onStep: (delta: number) => void
  onReset: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <View style={styles.demobar}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={[styles.toggle, shadow.card]}
      >
        <Text style={styles.toggleLabel}>{open ? 'Hide' : 'Demo'}</Text>
      </Pressable>

      {open ? (
        <View style={[styles.panel, shadow.lift]}>
          <View style={styles.group}>
            <Text style={styles.label}>Viewing as</Text>
            <View style={styles.seg}>
              {ROLES.map((id) => (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: role === id }}
                  onPress={() => onRole(id)}
                  style={[styles.segBtn, role === id && styles.segBtnOn]}
                >
                  <Text style={[styles.segLabel, role === id && styles.segLabelOn]}>
                    {ROLE_LABELS[id]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Demo date</Text>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous day"
                onPress={() => onStep(-1)}
                style={styles.stepBtn}
              >
                <Text style={styles.stepGlyph}>−</Text>
              </Pressable>
              <Text style={styles.day}>{date}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next day"
                onPress={() => onStep(1)}
                style={styles.stepBtn}
              >
                <Text style={styles.stepGlyph}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable accessibilityRole="button" onPress={onReset} style={styles.reset}>
            <Text style={styles.resetLabel}>Reset demo</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  demobar: {
    position: 'relative',
    zIndex: 20,
    alignItems: 'flex-end',
  },
  toggle: {
    minHeight: tap,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
  },
  toggleLabel: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    letterSpacing: 0.5,
    color: color.inkSoft,
  },
  panel: {
    position: 'absolute',
    top: tap + space.sm,
    right: 0,
    zIndex: 30,
    width: 220,
    gap: space.lg,
    padding: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
  },
  group: {
    gap: space.sm,
  },
  label: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: color.inkFaint,
  },
  seg: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.lineStrong,
    overflow: 'hidden',
  },
  segBtn: {
    flex: 1,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  segBtnOn: {
    backgroundColor: color.sageDeep,
  },
  segLabel: {
    fontSize: font.size.caption,
    fontWeight: font.weight.semibold,
    color: color.inkSoft,
  },
  segLabelOn: {
    color: color.surface,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: tap,
    height: tap,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  stepBtnOff: {
    opacity: 0.35,
  },
  stepGlyph: {
    fontSize: font.size.heading,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  day: {
    fontSize: font.size.small,
    fontWeight: font.weight.semibold,
    color: color.ink,
  },
  reset: {
    minHeight: tap,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: color.surfaceWarm,
  },
  resetLabel: {
    fontSize: font.size.small,
    fontWeight: font.weight.semibold,
    color: color.inkSoft,
  },
})
