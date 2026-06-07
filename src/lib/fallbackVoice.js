/**
 * Template DJ lines for the deterministic fallback only (when the AI is
 * unavailable). The AI writes the real lines in normal operation.
 */
const TEMPLATES = {
  warm_start: 'Let’s ease in and warm things up.',
  gentle_activation: 'Let’s warm this up without rushing it — a steady groove to get you moving.',
  focus_flow: 'Settling the room into something clean and steady so you can lock in.',
  mood_repair: 'Keeping things warm and easy here — a gentle lift, no pushing.',
  lock_the_groove: 'Locking the pulse — same pocket, easy to ride.',
  push_through: 'Leaning in now — this one’s got the drive to carry you through.',
  recover_smoothly: 'Bringing it down soft — let the mix breathe.',
  celebrate: 'This one’s a win — turn it up.',
  explore_adjacent: 'Here’s something a little new that still sits in your lane.',
};

export function djLineTemplate({ ctx, mission, track }) {
  const greet = /morning/i.test(ctx.timeOfDay || '')
    ? 'Good morning'
    : /evening|night/i.test(ctx.timeOfDay || '')
      ? 'Good evening'
      : 'Hey';
  const hi = ctx.userName ? `${greet}, ${ctx.userName}. ` : '';
  return `${hi}${TEMPLATES[mission] || TEMPLATES.gentle_activation} Here’s “${track.title}” by ${track.artist}.`;
}
