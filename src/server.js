/**
 * HTTP server entry — loads env, boots Express app from `app.js`.
 */
import 'dotenv/config';
import { createApp } from './app.js';
import { CONTEXTS } from './data/contexts.js';
import { TRACKS } from './data/tracks.js';
import { aiEnabled } from './integrations/openai.js';

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`\n  Magic Shuffle → http://127.0.0.1:${PORT}`);
  console.log(`  AI: ${aiEnabled() ? 'enabled (OpenAI)' : 'disabled — deterministic fallbacks'}`);
  console.log(`  ${TRACKS.length} tracks · ${CONTEXTS.length} context profiles\n`);
});
