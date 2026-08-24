import type { ChipId, CoachChip, CoachNode, DayContent, DayType, PlanSuggestion, Role } from './types'
import { DAYS, bestEveningDay, bestEveningSentence } from './days'

/**
 * Scripted AI Coach conversations.
 *
 * There is no model here. Each chip resolves to an entry node and the store
 * walks a flat graph of `say` / `choice` / `summary` nodes. Pacing (typing
 * delay, indicator) belongs to the UI; the walk belongs to the store.
 *
 * Nodes are keyed by **day number**, not by day type, even where the copy for
 * two days is identical. Keying on day type is what let day 4 inherit day 1's
 * neutral copy on the app's chattiest surface, and it did the same to day 7 —
 * whose Plan tab leads with a date night — by handing it day 1's "no
 * conversation required" option. With a per-day key, any day can diverge by
 * changing data rather than by changing the resolver.
 *
 * Copy still comes from per-*variant* tables, which is the day type plus one
 * extra case for the sensitive Calm day. That variant key is internal: it never
 * reaches the UI, which only ever sees four day types and four pill colours.
 */
type VariantKey = DayType | 'calmSensitive'

function variantKey(day: DayContent): VariantKey {
  return day.sensitive ? 'calmSensitive' : day.dayType
}

export const COACH_CHIPS: CoachChip[] = [
  { id: 'planTonight', label: 'Plan tonight' },
  { id: 'supportTip', label: 'Support tip', role: 'darnell' },
  { id: 'talkBetter', label: 'Talk better' },
  { id: 'dateIdea', label: 'Date idea' },
  { id: 'whyToday', label: 'Why today?' },
  { id: 'quickCheckIn', label: 'Quick check-in' },
]

export function chipsForRole(role: Role): CoachChip[] {
  return COACH_CHIPS.filter((chip) => chip.role === undefined || chip.role === role)
}

const nodes: Record<string, CoachNode> = {}

function add(node: CoachNode): CoachNode {
  nodes[node.id] = node
  return node
}

/** Node id prefix for a chip on a given day. */
function base(chip: ChipId, day: DayContent): string {
  return `${chip}:d${day.day}`
}

// --- Plan tonight ---------------------------------------------------------
// The low-energy opener is the spec's scripted scenario, verbatim. The three
// options are that day's own plans filtered on `setting`, so the coach can
// never recommend something the Plan tab contradicts.

const PLAN_OPENERS: Record<VariantKey, string> = {
  lowEnergy: 'Got it. Tonight looks better for something low-effort and cosy.',
  calm: 'Got it. Tonight looks flexible — it will work either way.',
  calmSensitive: 'Got it. Tonight suits something gentle and low-pressure.',
  social: 'Got it. Tonight is a good one to actually go out.',
  focused: 'Got it. Tonight is a good one to sort something, then relax.',
}

const PLAN_QUESTION = 'Want 3 options based on your usual vibe?'

/**
 * Three options for a Home / Out / Either tap, drawn from the day's own pool.
 *
 * Each day carries two `home`, two `out` and one `either` plan, which is what
 * makes three options reachable on every branch. Filtering a shallower pool
 * silently returns one or two where the script promises three, so
 * `content-rules.test.ts` asserts the count rather than trusting the shape.
 */
function optionsFor(day: DayContent, setting: 'home' | 'out' | 'either'): PlanSuggestion[] {
  const bySetting = (want: PlanSuggestion['setting']) =>
    day.plans.filter((plan) => plan.setting === want)

  if (setting === 'either') {
    return [...bySetting('home').slice(0, 1), ...bySetting('out').slice(0, 1), ...bySetting('either')].slice(0, 3)
  }
  return [...bySetting(setting), ...bySetting('either')].slice(0, 3)
}

for (const day of DAYS) {
  const id = base('planTonight', day)
  add({
    kind: 'say',
    id: `${id}:intro`,
    messages: [PLAN_OPENERS[variantKey(day)], PLAN_QUESTION],
    next: `${id}:pick`,
  })
  add({
    kind: 'choice',
    id: `${id}:pick`,
    options: [
      { label: 'Home', next: `${id}:home` },
      { label: 'Out', next: `${id}:out` },
      { label: 'Either', next: `${id}:either` },
    ],
  })
  for (const setting of ['home', 'out', 'either'] as const) {
    const options = optionsFor(day, setting)
    add({
      kind: 'summary',
      id: `${id}:${setting}`,
      title: 'Three options for tonight',
      lines: options.map((plan) => plan.title),
      outputType: 'plan',
      logText: 'Plan suggestion saved',
      planTitle: options[0].title,
    })
  }
}

// --- Support tip (Darnell only) ----------------------------------------------
// The low-energy variant is the spec's scripted scenario, verbatim.

interface SupportVariant {
  approach: string[]
  short: string
  warm: string
}

const SUPPORT_TIP: Record<VariantKey, SupportVariant> = {
  lowEnergy: {
    approach: [
      'Today is a lower-energy one, so the most useful thing you can do is take something off her plate.',
      'Offer once, keep it small, and leave the door open rather than asking her to decide.',
    ],
    short: 'Want a chilled night? I can handle dinner.',
    warm: 'Want a chilled night? I can handle dinner — no pressure to do anything.',
  },
  calm: {
    approach: [
      'Today is a steady one. A short check-in lands better than a long conversation.',
      'Keep it light and specific — one question, not a list.',
    ],
    short: 'How has today been?',
    warm: 'How has today been? No agenda, just wondering how you are doing.',
  },
  calmSensitive: {
    approach: [
      'Small things may land heavier today, so patience is worth more than getting to the point.',
      'Lead with warmth and let her set the pace of anything bigger.',
    ],
    short: 'Thinking of you today.',
    warm: 'Thinking of you today — nothing needed from you, just wanted you to know.',
  },
  social: {
    approach: [
      'Today is an outward-facing one, so an invitation will be more welcome than usual.',
      'Suggest something specific — it is easier to say yes to than an open question.',
    ],
    short: 'Fancy going out tonight?',
    warm: 'Fancy going out tonight? Dinner and a walk, my treat — you pick where.',
  },
  focused: {
    approach: [
      'Today is a clearer one for decisions, so this is a good moment for the conversation you have both been putting off.',
      'Come with options rather than an open question, and agree one next step.',
    ],
    short: 'Shall we sort the plan tonight?',
    warm: 'Shall we sort the plan tonight? I have a couple of ideas — should take ten minutes.',
  },
}

for (const day of DAYS) {
  const id = base('supportTip', day)
  const variant = SUPPORT_TIP[variantKey(day)]
  add({
    kind: 'say',
    id: `${id}:intro`,
    messages: [...variant.approach, 'Here is something you could send. Short or warm?'],
    next: `${id}:tone`,
  })
  add({
    kind: 'choice',
    id: `${id}:tone`,
    options: [
      { label: 'Short', next: `${id}:short` },
      { label: 'Warm', next: `${id}:warm` },
    ],
  })
  add({
    kind: 'summary',
    id: `${id}:short`,
    title: 'Ready to send',
    lines: ['Short and easy to reply to.'],
    sendableMessage: variant.short,
    outputType: 'message',
    logText: 'Support message saved',
  })
  add({
    kind: 'summary',
    id: `${id}:warm`,
    title: 'Ready to send',
    lines: ['Warmer, and takes the pressure off replying.'],
    sendableMessage: variant.warm,
    outputType: 'message',
    logText: 'Support message saved',
  })
}

// --- Talk better ---------------------------------------------------------
// Soft-start framework. The framing line varies by day; the topic examples do
// not, because the framework is the point and the framework does not change.

const TALK_OPENERS: Record<VariantKey, string> = {
  calm: 'Good day for this — things should feel easier to say than usual.',
  calmSensitive:
    'Worth going gently today. The same words can land differently depending on the day they arrive on.',
  lowEnergy: 'Keep it short today. A long conversation will be harder work than it needs to be.',
  social: 'Today is a good one for talking — you will both have more room for it.',
  focused: 'Good timing. Decisions and clear conversations both land more easily today.',
}

const TALK_FRAMEWORK = [
  'A soft start works better than a strong opening. Three parts: what you noticed, how it felt, what you would like.',
  'Skip the "you always" version — describe the moment, not the person.',
]

const TALK_TOPICS: { label: string; id: string; lines: string[]; example: string }[] = [
  {
    label: 'Money',
    id: 'money',
    lines: [
      'Noticed: the spending conversation keeps getting postponed.',
      'Felt: uneasy not knowing where you both stand.',
      'Asked for: twenty minutes this week to look at it together.',
    ],
    example:
      'I noticed we keep putting off the money chat, and it leaves me a bit uneasy. Could we give it twenty minutes this week?',
  },
  {
    label: 'Plans',
    id: 'plans',
    lines: [
      'Noticed: weekends are getting filled before you talk about them.',
      'Felt: a bit rushed, even though nobody meant it that way.',
      'Asked for: a quick check with each other before saying yes.',
    ],
    example:
      'I noticed our weekends get booked before we talk about them, and I end up feeling a bit rushed. Could we check with each other first?',
  },
  {
    label: 'Intimacy',
    id: 'intimacy',
    lines: [
      'Noticed: you have been passing each other rather than spending time together.',
      'Felt: further away than usual.',
      'Asked for: one evening with nothing else in it.',
    ],
    example:
      'I noticed we have been passing each other lately, and I miss you. Could we keep one evening free this week?',
  },
  {
    label: 'Family',
    id: 'family',
    lines: [
      'Noticed: visits get agreed without much warning.',
      'Felt: caught on the back foot.',
      'Asked for: a heads-up before dates are fixed.',
    ],
    example:
      'I noticed family visits tend to get fixed before we talk, and it catches me on the back foot. Could we agree dates together first?',
  },
  {
    label: 'Other',
    id: 'other',
    lines: [
      'Noticed: name the moment, not the habit.',
      'Felt: one word is enough.',
      'Asked for: something small and specific they can actually do.',
    ],
    example:
      'When that happened earlier, I felt a bit off about it. Could we try it differently next time?',
  },
]

for (const topic of TALK_TOPICS) {
  add({
    kind: 'summary',
    id: `talkBetter:topic:${topic.id}`,
    title: `Soft start — ${topic.label.toLowerCase()}`,
    lines: topic.lines,
    sendableMessage: topic.example,
    outputType: 'framework',
    logText: 'Conversation framework saved',
  })
}

for (const day of DAYS) {
  const id = base('talkBetter', day)
  add({
    kind: 'say',
    id: `${id}:intro`,
    messages: [TALK_OPENERS[variantKey(day)], ...TALK_FRAMEWORK, 'What is it about?'],
    next: `${id}:topic`,
  })
  add({
    kind: 'choice',
    id: `${id}:topic`,
    options: TALK_TOPICS.map((topic) => ({
      label: topic.label,
      next: `talkBetter:topic:${topic.id}`,
    })),
  })
}

// --- Date idea -----------------------------------------------------------

const BEST_EVENING_SENTENCE = bestEveningSentence()
const BEST_EVENING_DAY = bestEveningDay()

for (const day of DAYS) {
  const id = base('dateIdea', day)
  const tonight = day.plans[0]
  const best = BEST_EVENING_DAY.plans.find((plan) => plan.setting === 'out') ?? BEST_EVENING_DAY.plans[0]
  add({
    kind: 'say',
    id: `${id}:intro`,
    messages: [
      BEST_EVENING_SENTENCE,
      'Want something for tonight, or shall we aim for that instead?',
    ],
    next: `${id}:when`,
  })
  add({
    kind: 'choice',
    id: `${id}:when`,
    options: [
      { label: 'Tonight', next: `${id}:tonight` },
      { label: 'Best evening', next: `${id}:best` },
    ],
  })
  add({
    kind: 'summary',
    id: `${id}:tonight`,
    title: 'For tonight',
    lines: [tonight.title, tonight.detail],
    outputType: 'plan',
    logText: 'Date idea saved',
    planTitle: tonight.title,
  })
  add({
    kind: 'summary',
    id: `${id}:best`,
    title: 'Your best evening this week',
    lines: [BEST_EVENING_SENTENCE, best.title, best.detail],
    outputType: 'plan',
    logText: 'Date idea saved',
    planTitle: best.title,
  })
}

// --- Why today? ----------------------------------------------------------
// The highest-risk copy in the app: "Why?" invites exactly the answer the
// content rules forbid. Timing, and how days tend to land — nothing measured,
// nothing counted, and no suggestion that there is anything to look at.

for (const day of DAYS) {
  const id = base('whyToday', day)
  add({
    kind: 'say',
    id: `${id}:intro`,
    messages: [
      day.why,
      'It is about timing rather than anything being wrong. Some days simply take a different approach than others.',
    ],
    next: `${id}:summary`,
  })
  add({
    kind: 'summary',
    id: `${id}:summary`,
    title: 'Today, in one line',
    lines: [day.todayGuidance, day.reassurance],
    outputType: 'explanation',
    logText: 'Explanation saved',
  })
}

// --- Quick check-in ------------------------------------------------------

const CHECK_IN_ANSWERS: { label: string; id: string; reply: string[] }[] = [
  {
    label: 'Good',
    id: 'good',
    reply: ['Good to hear.', 'Nothing to change then — today should stay straightforward.'],
  },
  {
    label: 'Tired',
    id: 'tired',
    reply: [
      'Understood. Worth keeping tonight light.',
      'One simple plan is plenty — nothing has to be decided now.',
    ],
  },
  {
    label: 'Stretched',
    id: 'stretched',
    reply: [
      'That is worth naming rather than pushing through.',
      'Smaller plans and a shorter conversation will both help today.',
    ],
  },
  {
    label: 'Off',
    id: 'off',
    reply: [
      'Thanks for saying so.',
      'Today is a good one to go gently and leave the bigger things for another day.',
    ],
  },
]

for (const answer of CHECK_IN_ANSWERS) {
  add({
    kind: 'say',
    id: `quickCheckIn:reply:${answer.id}`,
    messages: answer.reply,
    next: `quickCheckIn:summary:${answer.id}`,
  })
  add({
    kind: 'summary',
    id: `quickCheckIn:summary:${answer.id}`,
    title: 'Check-in noted',
    lines: [`You said: ${answer.label.toLowerCase()}.`, answer.reply[1]],
    outputType: 'checkin',
    logText: 'Check-in saved',
  })
}

for (const day of DAYS) {
  const id = base('quickCheckIn', day)
  add({
    kind: 'say',
    id: `${id}:intro`,
    messages: ['Quick one — how is today going?'],
    next: `${id}:pick`,
  })
  add({
    kind: 'choice',
    id: `${id}:pick`,
    options: CHECK_IN_ANSWERS.map((answer) => ({
      label: answer.label,
      next: `quickCheckIn:reply:${answer.id}`,
    })),
  })
}

export const COACH_NODES: Readonly<Record<string, CoachNode>> = nodes

/** Entry node for a chip on a given day. */
export function getCoachEntry(chip: ChipId, day: DayContent): string {
  return `${base(chip, day)}:intro`
}

export function getCoachNode(id: string): CoachNode | null {
  return COACH_NODES[id] ?? null
}
