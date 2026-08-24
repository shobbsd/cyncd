import { useState } from 'react'
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { color, font, space, tap } from '../theme/tokens'

/**
 * The "Why?" expansion. Gentle, human language — the copy itself is content,
 * and this only decides that the answer stays folded away until asked for.
 */
export function WhyDisclosure({ why }: { why: string }) {
  const [open, setOpen] = useState(false)

  const toggle = () => {
    // The web build got this from a CSS transition. `LayoutAnimation` is the
    // closest native equivalent that does not pull in a whole animation
    // library for one disclosure — it animates the reflow the state change
    // causes, so it has to be called immediately before the setState.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen((value) => !value)
  }

  return (
    <View style={styles.why}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={toggle}
        style={styles.toggle}
      >
        <Text style={styles.toggleLabel}>Why?</Text>
        <Svg width={14} height={14} viewBox="0 0 16 16">
          <Path
            // Rotating the chevron would need a transform on an SVG child;
            // swapping the path is one less moving part for the same result.
            d={open ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'}
            stroke={color.inkSoft}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Pressable>
      {open ? <Text style={styles.body}>{why}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  why: {
    borderTopWidth: 1,
    borderTopColor: color.line,
    paddingTop: space.sm,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: tap,
  },
  toggleLabel: {
    fontSize: font.size.small,
    fontWeight: font.weight.semibold,
    color: color.inkSoft,
  },
  body: {
    fontSize: font.size.small,
    lineHeight: 22,
    color: color.inkSoft,
    paddingBottom: space.sm,
  },
})
