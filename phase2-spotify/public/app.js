// MoodAgent frontend
const $ = (id) => document.getElementById(id);
const SLIDERS = ['energy', 'stress', 'sleep'];

let session = { loggedIn: false, accessToken: null, profile: null };
let player = null;
let deviceId = null;
let lastTracks = [];
let previewAudio = null;

// ---------- boot ----------
init();

async function init() {
  hydrateFromUrl();
  wireSliders();
  wirePresets();
  wireButtons();
  updateThemeFromSliders();
  renderHistory();
  await loadSession();
  surfaceAuthError();
}

// ---------- session / auth ----------
async function loadSession() {
  try {
    const r = await fetch('/api/session');
    session = await r.json();
  } catch {
    session = { loggedIn: false };
  }
  renderAuth();
  if (session.loggedIn) initPlayer();
}

function renderAuth() {
  const el = $('authArea');
  if (session.loggedIn) {
    const name = session.profile?.display_name || 'Spotify user';
    const plan = session.profile?.product === 'premium' ? 'Premium' : 'Free';
    el.innerHTML = `<span>${name} · ${plan}</span>
      <button class="linklike" id="logoutBtn">Log out</button>`;
    $('logoutBtn').onclick = async () => {
      await fetch('/api/logout', { method: 'POST' });
      location.href = '/';
    };
  } else {
    el.innerHTML = `<button class="login-btn" onclick="location.href='/login'">
      Connect Spotify</button>`;
  }
}

function surfaceAuthError() {
  const err = new URLSearchParams(location.search).get('error');
  if (err) setStatus(`Spotify auth error: ${err}`, true);
}

// ---------- sliders ----------
function wireSliders() {
  for (const id of SLIDERS) {
    const input = $(id);
    input.addEventListener('input', () => {
      $(`${id}Val`).textContent = input.value;
      updateThemeFromSliders();
    });
  }
}

function readSliders() {
  return {
    energy: +$('energy').value,
    stress: +$('stress').value,
    sleep: +$('sleep').value,
  };
}

function setSliders({ energy, stress, sleep }, animate = false) {
  const set = (id, v) => {
    $(id).value = v;
    $(`${id}Val`).textContent = Math.round(v);
  };
  if (!animate) {
    set('energy', energy);
    set('stress', stress);
    set('sleep', sleep);
    updateThemeFromSliders();
    return;
  }
  // little animated tween for "surprise me"
  const from = readSliders();
  const to = { energy, stress, sleep };
  const start = performance.now();
  const dur = 500;
  (function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const ease = 1 - Math.pow(1 - t, 3);
    for (const id of SLIDERS) set(id, from[id] + (to[id] - from[id]) * ease);
    updateThemeFromSliders();
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

// ---------- mood-reactive theme (client-side mirror of interpolate) ----------
function localValenceArousal({ energy, stress, sleep }) {
  const c = (x) => Math.max(0, Math.min(1, x));
  const e = energy / 100, s = stress / 100, q = sleep / 100;
  return {
    arousal: c(0.6 * e + 0.25 * q - 0.3 * s + 0.2),
    valence: c(0.35 * e + 0.4 * q - 0.45 * s + 0.3),
  };
}

function applyTheme(valence, arousal) {
  // valence -> hue (red 0 .. green 140), arousal -> saturation/brightness
  const hue = Math.round(valence * 140);
  const sat = Math.round(45 + arousal * 40);
  document.documentElement.style.setProperty('--hue', hue);
  document.documentElement.style.setProperty('--sat', `${sat}%`);
  document.documentElement.style.setProperty('--accent', `hsl(${hue}, ${sat}%, 60%)`);
  document.documentElement.style.setProperty(
    '--accent-soft',
    `hsla(${hue}, ${sat}%, 60%, 0.15)`
  );
  document.querySelector('.orb').style.opacity = 0.25 + arousal * 0.3;
}

function updateThemeFromSliders() {
  const { valence, arousal } = localValenceArousal(readSliders());
  applyTheme(valence, arousal);
}

// ---------- presets / buttons ----------
function wirePresets() {
  document.querySelectorAll('.chip[data-e]').forEach((btn) => {
    btn.onclick = () =>
      setSliders({ energy: +btn.dataset.e, stress: +btn.dataset.s, sleep: +btn.dataset.q });
  });
  $('surprise').onclick = () =>
    setSliders(
      {
        energy: Math.round(Math.random() * 100),
        stress: Math.round(Math.random() * 100),
        sleep: Math.round(Math.random() * 100),
      },
      true
    );
}

function wireButtons() {
  $('recommend').onclick = recommend;
  $('share').onclick = shareMood;
}

// ---------- recommend ----------
async function recommend() {
  if (!session.loggedIn) {
    setStatus('Connect Spotify first.', true);
    return;
  }
  const btn = $('recommend');
  btn.disabled = true;
  setStatus('Reading your mood…');
  try {
    const r = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readSliders()),
    });
    if (r.status === 401) {
      setStatus('Session expired — reconnect Spotify.', true);
      session.loggedIn = false;
      renderAuth();
      return;
    }
    const data = await r.json();
    if (!r.ok) throw new Error(data.detail || data.error || 'failed');
    renderMood(data.mood);
    lastTracks = data.tracks;
    renderTracks(data.tracks);
    saveHistory(data.mood);
    if (data.tracks.length) {
      setStatus(`${data.tracks.length} tracks for “${data.mood.moodLabel}”. Tap ▶ to play.`);
      // auto-play the top pick
      playTrack(data.tracks[0]);
    } else {
      setStatus('No tracks found — try different sliders.', true);
    }
  } catch (e) {
    setStatus(`Error: ${e.message}`, true);
  } finally {
    btn.disabled = false;
  }
}

function renderMood(mood) {
  $('moodCard').classList.remove('hidden');
  $('moodLabel').textContent = mood.moodLabel;
  $('moodBlurb').textContent = mood.blurb;
  $('valenceVal').textContent = mood.valence;
  $('arousalVal').textContent = mood.arousal;
  applyTheme(mood.valence, mood.arousal);
}

function renderTracks(tracks) {
  const ul = $('tracks');
  ul.innerHTML = '';
  for (const t of tracks) {
    const li = document.createElement('li');
    li.className = 'track';
    li.innerHTML = `
      <button class="play-btn" title="Play">▶</button>
      <img src="${t.image || ''}" alt="" />
      <div class="track-meta">
        <div class="track-name">${escapeHtml(t.name)}</div>
        <div class="track-artist">${escapeHtml(t.artists)}</div>
      </div>
      <a class="btnlink" href="${t.spotifyUrl}" target="_blank" rel="noopener">Open</a>`;
    li.querySelector('.play-btn').onclick = () => playTrack(t);
    ul.appendChild(li);
  }
}

// ---------- playback: SDK (Premium) -> preview clip -> open in Spotify ----------
function initPlayer() {
  if (!window.Spotify || !session.accessToken) return;
  if (player) return;
  player = new Spotify.Player({
    name: 'MoodAgent Player',
    getOAuthToken: (cb) => cb(session.accessToken),
    volume: 0.6,
  });
  player.addListener('ready', ({ device_id }) => (deviceId = device_id));
  player.addListener('not_ready', () => (deviceId = null));
  player.addListener('initialization_error', ({ message }) => console.warn(message));
  player.addListener('authentication_error', ({ message }) => console.warn(message));
  player.addListener('account_error', () => {
    setPlayerStatus('Premium required for full-track playback — using previews.');
  });
  player.addListener('player_state_changed', (s) => {
    if (s?.track_window?.current_track) {
      setPlayerStatus(s.paused ? 'Paused' : 'Playing full track ♪');
    }
  });
  player.connect();
}

// When the SDK script finishes loading after our session is ready.
window.onSpotifyWebPlaybackSDKReady = () => {
  if (session.loggedIn) initPlayer();
};

async function playTrack(t) {
  showNowPlaying(t);
  stopPreview();

  const isPremium = session.profile?.product === 'premium';

  // 1) Full track via Web Playback SDK (Premium only)
  if (isPremium && deviceId) {
    const r = await fetch('/api/play', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri: t.uri, deviceId }),
    });
    if (r.ok) {
      setPlayerStatus('Playing full track ♪');
      return;
    }
  }

  // 2) 30-second preview clip (no Premium needed) — often null in 2026
  if (t.previewUrl) {
    previewAudio = new Audio(t.previewUrl);
    previewAudio.volume = 0.7;
    previewAudio.play();
    setPlayerStatus('Playing 30s preview ♪');
    return;
  }

  // 3) Fallback: open in Spotify
  setPlayerStatus('Preview unavailable — open in Spotify to play full track.');
  window.open(t.spotifyUrl, '_blank', 'noopener');
}

function stopPreview() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio = null;
  }
}

function showNowPlaying(t) {
  $('player').classList.remove('hidden');
  $('nowArt').src = t.image || '';
  $('nowName').textContent = t.name;
  $('nowArtist').textContent = t.artists;
}

function setPlayerStatus(msg) {
  $('playerStatus').textContent = msg;
}

// ---------- share-a-mood URL ----------
function shareMood() {
  const { energy, stress, sleep } = readSliders();
  const url = `${location.origin}/?e=${energy}&s=${stress}&q=${sleep}`;
  navigator.clipboard?.writeText(url);
  setStatus('Mood link copied to clipboard 🔗');
}

function hydrateFromUrl() {
  const p = new URLSearchParams(location.search);
  const map = { e: 'energy', s: 'stress', q: 'sleep' };
  for (const [k, id] of Object.entries(map)) {
    if (p.has(k)) {
      const v = Math.max(0, Math.min(100, +p.get(k)));
      $(id).value = v;
      $(`${id}Val`).textContent = v;
    }
  }
}

// ---------- mood history (localStorage) ----------
function saveHistory(mood) {
  const hist = JSON.parse(localStorage.getItem('moodHistory') || '[]');
  hist.push({
    date: new Date().toISOString(),
    ...mood.inputs,
    label: mood.moodLabel,
  });
  localStorage.setItem('moodHistory', JSON.stringify(hist.slice(-30)));
  renderHistory();
}

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem('moodHistory') || '[]');
  if (!hist.length) {
    $('historyBar').textContent = '';
    return;
  }
  const recent = hist.slice(-5).map((h) => h.label).join(' → ');
  $('historyBar').textContent = `Recent moods: ${recent}`;
}

// ---------- utils ----------
function setStatus(msg, isError = false) {
  const el = $('status');
  el.textContent = msg;
  el.classList.toggle('error', isError);
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
