import { useEffect, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { CoachNode } from '../content'
import { color, font, radius, space } from '../theme/tokens'
import { Btn, Chip, Faint } from './ui'

/** Long enough to read as composing, short enough not to stall a live demo. */
const TYPING_MS = 620
const BEAT_MS = 180

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface Line {
  who: 'ai' | 'user'
  text: string
}

/**
 * The AI Coach chat sheet — slides up over whatever screen you were on.
 *
 * Pacing lives here and node advance lives in the store: a `say` node types its
 * messages out in order and only then calls `advance()`. That split is why the
 * conversation cannot run ahead of the animation.
 *
 * The transcript is local on purpose. It is presentation, it dies with the
 * sheet, and the durable record of a conversation is the log entry that Save or
 * Send writes.
 */
export function CoachSheet({
  node,
  title,
  onAdvance,
  onChoose,
  onSave,
  onSend,
  onClose,
}: {
  node: CoachNode
  title: string
  onAdvance: () => void
  onChoose: (index: number) => void
  onSave: () => void
  onSend: () => void
  onClose: () => void
}) {
  const [lines, setLines] = useState<Line[]>([])
  const [typing, setTyping] = useState(false)
  const [outcome, setOutcome] = useState<'saved' | 'sent' | null>(null)
  const insets = useSafeAreaInsets()

  const logRef = useRef<ScrollView>(null)
  // Kept in a ref so the typing effect depends on the node alone — `advance`
  // gets a new identity on most renders and would otherwise restart the run.
  const advanceRef = useRef(onAdvance)
  advanceRef.current = onAdvance

  useEffect(() => {
    if (node.kind !== 'say') return

    let cancelled = false

    const run = async () => {
      for (const message of node.messages) {
        setTyping(true)
        await wait(TYPING_MS)
        if (cancelled) return
        setTyping(false)
        setLines((current) => [...current, { who: 'ai', text: message }])
        await wait(BEAT_MS)
        if (cancelled) return
      }
      advanceRef.current()
    }

    void run()

    return () => {
      cancelled = true
      setTyping(false)
    }
  }, [node])

  // A summary is a fresh outcome each time one is reached.
  useEffect(() => setOutcome(null), [node])

  useEffect(() => {
    logRef.current?.scrollToEnd({ animated: true })
  }, [lines, typing, node])

  const choose = (index: number, label: string) => {
    setLines((current) => [...current, { who: 'user', text: label }])
    onChoose(index)
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.sheet}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close conversation"
          onPress={onClose}
          style={styles.scrim}
        />

        <View style={[styles.panel, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.grip} />
          <View style={styles.head}>
            <Text style={styles.title}>{title}</Text>
            <Btn label="Close" variant="ghost" onPress={onClose} />
          </View>

          <ScrollView ref={logRef} style={styles.log} contentContainerStyle={styles.logContent}>
            {lines.map((line, index) => (
              <View
                key={index}
                style={[styles.bubble, line.who === 'user' && styles.bubbleUser]}
              >
                <Text style={[styles.bubbleText, line.who === 'user' && styles.bubbleTextUser]}>
                  {line.text}
                </Text>
              </View>
            ))}

            {typing ? (
              <View style={[styles.bubble, styles.typing]} accessibilityLabel="Typing">
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            ) : null}

            {node.kind === 'summary' ? (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>{node.title}</Text>
                <View style={styles.summaryLines}>
                  {node.lines.map((line) => (
                    <View key={line} style={styles.summaryLine}>
                      <View style={styles.summaryBullet} />
                      <Text style={styles.summaryLineText}>{line}</Text>
                    </View>
                  ))}
                </View>

                {node.sendableMessage !== undefined ? (
                  <Text style={styles.sendable}>{node.sendableMessage}</Text>
                ) : null}

                {outcome === null ? (
                  <View style={styles.summaryActions}>
                    <Btn
                      label="Save"
                      variant="secondary"
                      onPress={() => {
                        onSave()
                        setOutcome('saved')
                      }}
                    />
                    <Btn
                      label="Send to partner"
                      onPress={() => {
                        onSend()
                        setOutcome('sent')
                      }}
                    />
                  </View>
                ) : (
                  <Faint>
                    {outcome === 'saved' ? 'Saved to your plans.' : 'Sent to your partner.'}
                  </Faint>
                )}
              </View>
            ) : null}
          </ScrollView>

          {node.kind === 'choice' ? (
            <View style={styles.foot}>
              {node.prompt !== undefined ? <Faint>{node.prompt}</Faint> : null}
              <View style={styles.chipRow}>
                {node.options.map((option, index) => (
                  <Chip
                    key={option.label}
                    label={option.label}
                    onPress={() => choose(index, option.label)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {node.kind === 'summary' ? (
            <View style={styles.foot}>
              <Btn label="Done" variant="secondary" block onPress={onClose} />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(51, 50, 46, 0.32)',
  },
  panel: {
    maxHeight: '86%',
    gap: space.md,
    paddingTop: space.sm,
    paddingHorizontal: space.lg,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: color.bg,
  },
  grip: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: color.lineStrong,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    color: color.ink,
  },
  log: {
    flexGrow: 0,
  },
  logContent: {
    gap: space.sm,
    paddingVertical: space.sm,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '86%',
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.soft,
    backgroundColor: color.surface,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: color.sageDeep,
  },
  bubbleText: {
    fontSize: font.size.small,
    lineHeight: 21,
    color: color.ink,
  },
  bubbleTextUser: {
    color: color.surface,
  },
  typing: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.inkFaint,
  },
  summary: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.soft,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surfaceWarm,
  },
  summaryTitle: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: color.ink,
  },
  summaryLines: {
    gap: space.sm,
  },
  summaryLine: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'flex-start',
  },
  summaryBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 7,
    backgroundColor: color.sageDeep,
  },
  summaryLineText: {
    flex: 1,
    fontSize: font.size.small,
    lineHeight: 21,
    color: color.ink,
  },
  sendable: {
    fontSize: font.size.small,
    lineHeight: 21,
    fontStyle: 'italic',
    color: color.inkSoft,
    padding: space.md,
    borderRadius: radius.soft,
    backgroundColor: color.surface,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  foot: {
    gap: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
})
