import type { DayContent, DayType, PlanSuggestion } from './types'

/**
 * The scripted 7-day week. `todayGuidance` and `partnerGuidance` are verbatim
 * from the spec and are covered by a test that fails if they are edited.
 *
 * Everything else here (`why`, `reassurance`, `partnerActions`, plans and
 * notification copy) is written for this prototype and is the copy a demo
 * viewer actually reads the most of — so it is held to the hard content rules
 * by `content.test.ts`: patterns and timing only, no measurement, no data, no
 * medical language, no blame in either direction.
 */
export const DAYS: DayContent[] = [
  {
    day: 1,
    dayType: 'calm',
    label: 'Calm',
    sensitive: false,
    todayGuidance:
      'Today may feel neutral or slightly changeable — keep plans flexible.',
    partnerGuidance:
      'Good day for light conversation rather than heavy topics. A short check-in works better than long discussions.',
    why: 'Days like this tend to sit in the middle — nothing strong in either direction. Keeping things loose means neither of you has to guess what the other needs.',
    reassurance: 'Nothing here needs acting on. It is a heads-up on timing, no more.',
    supportApproach: 'conversation',
    partnerActions: [
      'Ask one light question rather than several',
      'Leave the bigger topics for another day',
      'Suggest something easy you both already enjoy',
    ],
    plans: [
      {
        id: 'd1-cook-together',
        day: 1,
        title: 'Cook something together',
        detail: 'Shared and unhurried, with room to talk or not talk.',
        setting: 'home',
      },
      {
        id: 'd1-series-early',
        day: 1,
        title: 'Series and an early finish',
        detail: 'Easy company with nothing to organise.',
        setting: 'home',
      },
      {
        id: 'd1-walk-and-coffee',
        day: 1,
        title: 'Walk and a coffee',
        detail: 'Low commitment, easy to move if the day changes shape.',
        setting: 'out',
      },
      {
        id: 'd1-somewhere-local',
        day: 1,
        title: 'Somewhere local you have not tried',
        detail: 'Small change of scene without making an event of it.',
        setting: 'out',
      },
      {
        id: 'd1-keep-it-open',
        day: 1,
        title: 'Keep it open and see how the evening lands',
        detail: 'Nothing booked, so neither of you has to commit early.',
        setting: 'either',
      },
    ],
    notification: {
      id: 'n-d1',
      day: 1,
      text: 'Today looks flexible — a short check-in will go further than a long one.',
      target: 'today',
    },
  },
  {
    day: 2,
    dayType: 'lowEnergy',
    label: 'Low Energy',
    sensitive: false,
    todayGuidance: 'Energy may dip earlier this evening — consider a relaxed night.',
    partnerGuidance: 'Short reassurance will feel supportive today.',
    why: 'Evenings around this point tend to wind down sooner than usual. Planning for a slower night means it feels like a choice rather than something falling through.',
    reassurance: 'A quiet night is a good outcome here, not a compromise.',
    supportApproach: 'reassurance',
    partnerActions: [
      'Say one warm thing without needing a reply',
      'Offer to sort dinner',
      'Keep the evening open rather than booked',
    ],
    plans: [
      {
        id: 'd2-film-night',
        day: 2,
        title: 'Film night + snack run',
        detail: 'Nothing to organise, easy to stop early if you want to.',
        setting: 'home',
      },
      {
        id: 'd2-takeaway',
        day: 2,
        title: 'Takeaway and an early night',
        detail: 'Takes the evening off the to-do list entirely.',
        setting: 'home',
      },
      {
        id: 'd2-short-walk',
        day: 2,
        title: 'Short walk, then home',
        detail: 'Fresh air without turning into a whole evening.',
        setting: 'out',
      },
      {
        id: 'd2-quiet-drink',
        day: 2,
        title: 'One drink somewhere quiet',
        detail: 'Out of the house, back before it feels like effort.',
        setting: 'out',
      },
      {
        id: 'd2-decide-later',
        day: 2,
        title: 'Decide at eight, no pressure either way',
        detail: 'Leaves room for the evening to be whatever it turns out to be.',
        setting: 'either',
      },
    ],
    notification: {
      id: 'n-d2',
      day: 2,
      text: 'Your partner may have lower energy tonight — lighter plans recommended.',
      target: 'partner',
    },
  },
  {
    day: 3,
    dayType: 'social',
    label: 'Social',
    sensitive: false,
    todayGuidance: 'Higher tolerance today — easier for social plans or going out.',
    partnerGuidance: 'A good time to enjoy time together outside routine.',
    why: 'This stretch of the week tends to feel more outward-facing. Making the plan now is easier than making it later in the week.',
    reassurance: 'If you would rather stay in, that is fine too. This is a nudge, not a plan.',
    supportApproach: 'conversation',
    partnerActions: [
      'Suggest something outside the usual routine',
      'Book it rather than leaving it open',
      'Let them pick the where',
    ],
    plans: [
      {
        id: 'd3-invite-someone',
        day: 3,
        title: 'Invite someone over',
        detail: 'Company on your own terms, with the front door as the limit.',
        setting: 'home',
      },
      {
        id: 'd3-cook-for-two',
        day: 3,
        title: 'Cook for two and open something nice',
        detail: 'Makes an occasion of it without leaving the house.',
        setting: 'home',
      },
      {
        id: 'd3-dinner-and-walk',
        day: 3,
        title: 'Nice night to go out — dinner then a walk',
        detail: 'The best evening of the week for something out of routine.',
        setting: 'out',
      },
      {
        id: 'd3-see-friends',
        day: 3,
        title: 'See friends together',
        detail: 'Easier to enjoy company today than later in the week.',
        setting: 'out',
      },
      {
        id: 'd3-drinks-nearby',
        day: 3,
        title: 'Drinks nearby, then decide',
        detail: 'Start small and let it grow if you are both enjoying it.',
        setting: 'either',
      },
    ],
    notification: {
      id: 'n-d3',
      day: 3,
      text: 'Good evening for something out of routine — worth making the plan today.',
      target: 'plan',
    },
  },
  {
    day: 4,
    dayType: 'calm',
    label: 'Calm',
    sensitive: true,
    todayGuidance:
      'Emotional sensitivity slightly higher — gentle communication recommended.',
    partnerGuidance:
      'Small misunderstandings may feel bigger than intended — patience will help today.',
    why: 'Timing matters a little more than usual today. The same sentence can land differently depending on the day it arrives on, so it is worth slowing down rather than pushing through.',
    reassurance: 'Nothing is wrong. Today just asks for a softer touch.',
    supportApproach: 'reassurance',
    partnerActions: [
      'Lead with a question rather than a conclusion',
      'Assume the kinder reading of anything short',
      'Save decisions for tomorrow',
    ],
    plans: [
      {
        id: 'd4-quiet-in',
        day: 4,
        title: 'Quiet night in, nothing planned',
        detail: 'Space to be in the same room without an agenda.',
        setting: 'home',
      },
      {
        id: 'd4-simple-cook',
        day: 4,
        title: 'Cook something simple, side by side',
        detail: 'Doing rather than discussing, which is easier today.',
        setting: 'home',
      },
      {
        id: 'd4-short-walk',
        day: 4,
        title: 'Short walk, no big conversation',
        detail: 'Side by side is easier than face to face today.',
        setting: 'out',
      },
      {
        id: 'd4-somewhere-familiar',
        day: 4,
        title: 'Somewhere familiar rather than somewhere new',
        detail: 'Nothing to navigate, nothing to decide on arrival.',
        setting: 'out',
      },
      {
        id: 'd4-leave-it-open',
        day: 4,
        title: 'Leave it open — decide later without it being a thing',
        detail: 'Removes the one decision that could feel like pressure.',
        setting: 'either',
      },
    ],
    notification: {
      id: 'n-d4',
      day: 4,
      text: 'Gentle day — patience will go further than getting to the point.',
      target: 'partner',
    },
  },
  {
    day: 5,
    dayType: 'focused',
    label: 'Focused',
    sensitive: false,
    todayGuidance: 'Better focus and decision-making today.',
    partnerGuidance: 'Suitable for planning conversations or organising upcoming tasks.',
    why: 'Decisions tend to feel clearer on days like this. A good window for the conversations that need some thinking behind them.',
    reassurance: 'Use it if it is useful. There is no list to get through.',
    supportApproach: 'conversation',
    partnerActions: [
      'Bring up the thing you have both been postponing',
      'Come with options rather than an open question',
      'Agree one next step, then leave it there',
    ],
    plans: [
      {
        id: 'd5-plan-the-month',
        day: 5,
        title: 'Sort the month over dinner',
        detail: 'Gets the admin done while it feels easy rather than heavy.',
        setting: 'home',
      },
      {
        id: 'd5-short-admin',
        day: 5,
        title: 'Twenty minutes of admin, then the evening is yours',
        detail: 'Bounded on purpose, so it does not eat the night.',
        setting: 'home',
      },
      {
        id: 'd5-dinner-talk',
        day: 5,
        title: 'Dinner somewhere you can actually talk',
        detail: 'A clear head and a quiet table go well together.',
        setting: 'out',
      },
      {
        id: 'd5-walk-and-plan',
        day: 5,
        title: 'Walk and work out the plan as you go',
        detail: 'Easier to agree things moving than sitting opposite each other.',
        setting: 'out',
      },
      {
        id: 'd5-book-something',
        day: 5,
        title: 'Book the thing you keep talking about',
        detail: 'Decisions land more easily today than they will later in the week.',
        setting: 'either',
      },
    ],
    notification: {
      id: 'n-d5',
      day: 5,
      text: 'Good day to make a decision together — bring options rather than questions.',
      target: 'plan',
    },
  },
  {
    day: 6,
    dayType: 'lowEnergy',
    label: 'Low Energy',
    sensitive: false,
    todayGuidance: 'Lower energy window approaching — lighter plans recommended.',
    partnerGuidance:
      'Quiet evening or shared activity at home may feel best. Suggest one simple option, then give space.',
    why: 'The end of the week tends to run lower. One simple suggestion usually helps more than a choice of five.',
    reassurance: 'Lighter plans are the point today, not a fallback.',
    supportApproach: 'space',
    partnerActions: [
      'Offer one option, not a menu',
      'Handle dinner without being asked',
      'Let quiet be quiet',
    ],
    plans: [
      {
        id: 'd6-film-night',
        day: 6,
        title: 'Film night + snack run',
        detail: 'One suggestion, nothing to decide, easy to say yes to.',
        setting: 'home',
      },
      {
        id: 'd6-same-room',
        day: 6,
        title: 'Same room, separate things',
        detail: 'Together without either of you having to perform an evening.',
        setting: 'home',
      },
      {
        id: 'd6-snack-run',
        day: 6,
        title: 'Snack run and a short walk',
        detail: 'Ten minutes out, then the sofa. No more than that.',
        setting: 'out',
      },
      {
        id: 'd6-change-of-scene',
        day: 6,
        title: 'Quick change of scene, then home',
        detail: 'Enough to break the day up without spending the evening on it.',
        setting: 'out',
      },
      {
        id: 'd6-one-option',
        day: 6,
        title: 'One simple option, decided late',
        detail: 'Keeps the choice to a yes or a no rather than a list.',
        setting: 'either',
      },
    ],
    notification: {
      id: 'n-d6',
      day: 6,
      text: 'Lighter plans suit tonight — one simple option is plenty.',
      target: 'today',
    },
  },
  {
    day: 7,
    dayType: 'calm',
    label: 'Calm',
    sensitive: false,
    todayGuidance: 'Stable and calm day — communication should feel easier.',
    partnerGuidance: 'Good opportunity for connection or a relaxed date night.',
    why: 'Things tend to feel steadier here. A conversation that felt awkward earlier in the week usually goes more easily on a day like this.',
    reassurance: 'Nothing to do differently today. A good one to just enjoy.',
    supportApproach: 'conversation',
    partnerActions: [
      'Suggest the date night now rather than later',
      'Pick something you both liked before',
      'Say what you appreciated this week',
    ],
    plans: [
      {
        id: 'd7-long-breakfast',
        day: 7,
        title: 'Long breakfast, no rush',
        detail: 'Unhurried and low effort, with time to actually talk.',
        setting: 'home',
      },
      {
        id: 'd7-cook-favourite',
        day: 7,
        title: 'Cook something you both like',
        detail: 'Familiar and easy, which is exactly what today suits.',
        setting: 'home',
      },
      {
        id: 'd7-date-night',
        day: 7,
        title: 'Relaxed date night',
        detail: 'Easiest day of the week to enjoy each other without effort.',
        setting: 'out',
      },
      {
        id: 'd7-favourite-walk',
        day: 7,
        title: 'Walk somewhere you both like',
        detail: 'Steady day, steady plan, good conversation on the way round.',
        setting: 'out',
      },
      {
        id: 'd7-either-works',
        day: 7,
        title: 'Date night, in or out — either works today',
        detail: 'Nothing about today argues for one over the other.',
        setting: 'either',
      },
    ],
    notification: {
      id: 'n-d7',
      day: 7,
      text: 'An easier day for talking — a good one to look back on the week together.',
      target: 'reflect',
    },
  },
]

export const FIRST_DAY = 1
export const LAST_DAY = DAYS.length

/**
 * Module-private on purpose. Exported, this is a loaded gun: `WEEKDAYS[day - 1]`
 * reads like the obvious thing and silently skips the anchor below, so day 3
 * comes back Wednesday instead of Saturday. It misread that way in review once
 * already. `weekdayFor()` is the only way to turn a day number into a name.
 */
const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

/**
 * Which weekday day 1 falls on.
 *
 * The scripted week is relative — nothing in the spec pins day 1 to a date — so
 * this is a free choice, and the only place it surfaces is the best-evening
 * sentence on Plan Together. Anchoring at Thursday puts the Social day on
 * Saturday, which is both the most believable night for it and what makes the
 * suggestion read as the spec's own example.
 *
 * It is an anchor rather than a hardcoded 'Saturday' on purpose: the sentence
 * still names whichever evening the week actually scores highest, so it can
 * never recommend a night whose own guidance says to keep plans light. Day 6 is
 * a Low Energy day telling you to suggest one simple option and then give space
 * — putting a date night there would be the app arguing with itself.
 */
const DAY_ONE_WEEKDAY_INDEX = 3

export function weekdayFor(day: number): string {
  return WEEKDAYS[(clampDay(day) - 1 + DAY_ONE_WEEKDAY_INDEX) % WEEKDAYS.length]
}

export function clampDay(day: number): number {
  if (!Number.isFinite(day)) return FIRST_DAY
  return Math.min(LAST_DAY, Math.max(FIRST_DAY, Math.round(day)))
}

export function getDay(day: number): DayContent {
  return DAYS[clampDay(day) - 1]
}

export const WEEK_STRIP: DayType[] = DAYS.map((d) => d.dayType)

/**
 * Which setting each day type should lead with on Plan Together.
 *
 * The pool is stored `[home, home, out, out, either]`, so taking the first
 * three puts two stay-at-home options on top of every day — including the
 * Social one, whose spec-mandated "dinner then a walk" ends up third — and
 * buries "Relaxed date night" on the day framed around connection. Day type
 * has to decide the order, not storage order.
 */
const PREFERRED_SETTINGS: Record<DayType, PlanSuggestion['setting'][]> = {
  social: ['out', 'either', 'home'],
  lowEnergy: ['home', 'either', 'out'],
  focused: ['either', 'out', 'home'],
  calm: ['out', 'home', 'either'],
}

/** Gentle days lead with staying in, whatever the underlying day type says. */
const SENSITIVE_SETTINGS: PlanSuggestion['setting'][] = ['home', 'out', 'either']

/**
 * The three plans the Plan tab shows: one of each setting, ordered by what the
 * day calls for. Every day carries at least one plan of each setting, so this
 * always returns exactly three.
 */
export function preferredPlans(day: DayContent): PlanSuggestion[] {
  const order = day.sensitive ? SENSITIVE_SETTINGS : PREFERRED_SETTINGS[day.dayType]
  return order.flatMap((setting) => day.plans.find((plan) => plan.setting === setting) ?? [])
}


/**
 * How good an evening each day type makes. Drives the date-night suggestion on
 * Plan Together — declared rather than hand-picked so it stays consistent with
 * whatever the week says.
 */
const EVENING_SCORE: Record<DayType, number> = {
  social: 3,
  calm: 2,
  focused: 1,
  lowEnergy: 0,
}

/** The best evening of the scripted week. Ties resolve to the earlier day. */
export function bestEveningDay(): DayContent {
  return DAYS.reduce((best, day) => {
    const score = EVENING_SCORE[day.dayType] - (day.sensitive ? 2 : 0)
    const bestScore = EVENING_SCORE[best.dayType] - (best.sensitive ? 2 : 0)
    return score > bestScore ? day : best
  }, DAYS[0])
}

export function bestEveningSentence(): string {
  return `${weekdayFor(bestEveningDay().day)} looks like your best evening this week.`
}
