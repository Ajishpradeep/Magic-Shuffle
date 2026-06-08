#!/usr/bin/env node
/**
 * CLI trigger — the headline "press the button" experience.
 *
 *   npm run shuffle                      # live: real weather + calendar + biometrics
 *   npm run shuffle -- --length 10
 *   npm run shuffle -- --name Jasmine
 *   npm run shuffle -- --action more_energy
 *
 * Assembles a live listener moment, builds an iso-principle playlist, and prints
 * it. Works with or without OpenAI/Spotify keys (deterministic fallback).
 */
import 'dotenv/config';
import { assembleLiveContext } from '../src/services/buildContext.js';
import { recommendPlaylist } from '../src/services/recommend.js';
import { describeBiometrics } from '../src/lib/generateBiometrics.js';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else out[key] = true;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const length = Math.min(20, Math.max(4, parseInt(args.length, 10) || 12));
const name = typeof args.name === 'string' ? args.name : 'You';
const action = typeof args.action === 'string' ? args.action : 'play_something';

const bar = (v) => '█'.repeat(Math.round((v || 0) * 10)).padEnd(10, '·');

console.log('\n🎧  Magic Shuffle — reading the room…\n');

const { context: ctx, sources } = await assembleLiveContext({ userName: name });
const result = await recommendPlaylist(ctx, { length, action });
const d = describeBiometrics(ctx);

console.log(`  ${ctx.timeOfDay} in ${ctx.location} · ${ctx.weather}`);
console.log(`  Next up: ${ctx.calendar}`);
console.log(
  `  Body: energy ${ctx.energyLevel} (${d.energyBand}) · stress ${ctx.stressLevel} (${d.stressBand}) · ` +
    `sleep ${ctx.sleepQuality} (${d.sleepBand}) · HRV ${ctx.hrv}ms · RHR ${ctx.restingHr}bpm`
);
console.log(
  `  Read: ${result.goalLabel}  (valence ${result.state.affect.valence} · arousal ${result.state.affect.arousal})`
);
console.log(`  Arc:  ${result.arc.start.tempoBpm}→${result.arc.target.tempoBpm} BPM, ` +
  `energy ${result.arc.start.energy}→${result.arc.target.energy}`);
console.log(`\n  🎙️  ${result.dj.line}\n`);

console.log(`  Playlist (${result.playlist.length} tracks · ${result.ai.mode}):`);
result.playlist.forEach((t, i) => {
  const n = String(i + 1).padStart(2, ' ');
  console.log(`  ${n}. ${t.title} — ${t.artist}`);
  console.log(`      ${t.predicted.tempoBpm} BPM  e${bar(t.predicted.energy)} v${bar(t.predicted.valence)}  ·  ${t.reason}`);
});

console.log(
  `\n  signals → weather:${sources.weather} · calendar:${sources.calendar} · ` +
    `biometrics:${sources.biometrics} · location:${sources.location}\n`
);
