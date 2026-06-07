import test from 'node:test';
import assert from 'node:assert/strict';

process.env.OPENAI_API_KEY = '';
process.env.SPOTIFY_CLIENT_ID = '';
process.env.SPOTIFY_CLIENT_SECRET = '';

const { recommend } = await import('../src/services/recommend.js');
const { getContext } = await import('../src/data/contexts.js');

test('deterministic fallback avoids UI title/artist exclude tags', async () => {
  const ctx = getContext('pitch_practice_taipei');
  const first = await recommend(ctx);
  const tag = `${first.recommendation.title} — ${first.recommendation.artist}`;

  const second = await recommend(ctx, { exclude: [tag] });

  assert.notEqual(second.recommendation.id, first.recommendation.id);
});

test('deterministic fallback still avoids raw track ids', async () => {
  const ctx = getContext('pitch_practice_taipei');
  const first = await recommend(ctx);

  const second = await recommend(ctx, { exclude: [first.recommendation.id] });

  assert.notEqual(second.recommendation.id, first.recommendation.id);
});

test('deterministic fallback returns the stable card shape', async () => {
  const ctx = getContext('deep_focus_block');

  const result = await recommend(ctx);

  assert.equal(result.ai.mode, 'deterministic');
  assert.equal(result.recommendation.featureSource, 'catalog');
  assert.ok(result.recommendation.id);
  assert.ok(Array.isArray(result.backups));
  assert.ok(result.backups.length > 0);
});
