// Sonicstride polished UI wired to the real AI-DJ backend.
const $ = (id) => document.getElementById(id);

let contexts = [];
let state = { contextId: null, currentMission: null, exclude: [] };
let session = { loggedIn: false };
let player = null;
let deviceId = null;
let currentCard = null;
let currentSetData = null;
let currentSet = [];
let currentIndex = -1;
let lastArtist = null;
let previewAudio = null;
let isLoading = false;
let playbackActive = false;
let demoUserName = 'Jasmine';
const MIN_ANALYSIS_LOADING_MS = 900;

const el = {
  app: document.querySelector('.app-shell'),
  heroTile: document.querySelector('.hero-tile'),
  heroBody: document.querySelector('.hero-body'),
  onboardingFlow: $('onboardingFlow'),
  nameForm: $('nameForm'),
  userNameInput: $('userNameInput'),
  beginSetupButton: $('beginSetupButton'),
  enterDemoButton: $('enterDemoButton'),
  setupTitle: $('setupTitle'),
  setupDetail: $('setupDetail'),
  watchConnector: $('watchConnector'),
  calendarConnector: $('calendarConnector'),
  weatherConnector: $('weatherConnector'),
  contextMenu: document.querySelector('.context-menu'),
  simulatorToggle: $('simulatorToggle'),
  scenarioList: $('scenarioList'),
  contextLabel: $('contextLabel'),
  missionLabel: $('missionLabel'),
  missionEyebrow: $('missionEyebrow'),
  greetingTitle: $('greetingTitle'),
  analysisOverlay: $('analysisOverlay'),
  analysisGreeting: $('analysisGreeting'),
  analysisDetail: $('analysisDetail'),
  trackTitle: $('trackTitle'),
  trackArtist: $('trackArtist'),
  bpmValue: $('bpmValue'),
  trackMeta: $('trackMeta'),
  albumArt: $('albumArt'),
  scoreInsight: $('scoreInsight'),
  progressTicks: $('progressTicks'),
  elapsedTime: $('elapsedTime'),
  remainingTime: $('remainingTime'),
  djLine: $('djLine'),
  reasonInsight: $('reasonInsight'),
  whyPanel: $('whyPanel'),
  whyGrid: $('whyGrid'),
  vibeScaleGrid: $('vibeScaleGrid'),
  featureSource: $('featureSource'),
  energyValue: $('energyValue'),
  sleepValue: $('sleepValue'),
  stressValue: $('stressValue'),
  energyHint: $('energyHint'),
  sleepHint: $('sleepHint'),
  stressHint: $('stressHint'),
  energyDots: $('energyDots'),
  sleepTicks: $('sleepTicks'),
  stressDots: $('stressDots'),
  weatherCondition: $('weatherCondition'),
  tempValue: $('tempValue'),
  locationValue: $('locationValue'),
  scheduleValue: $('scheduleValue'),
  upNextList: $('upNextList'),
  spotifyAuth: $('spotifyAuth'),
  playSessionButton: $('playSessionButton'),
  playButton: $('playButton'),
  energyButton: $('energyButton'),
  smoothButton: $('smoothButton'),
  keepButton: $('keepButton'),
  reshuffleButton: $('reshuffleButton'),
  playbar: $('playbar'),
  togglePlay: $('togglePlay'),
  nowPlaying: $('nowPlaying'),
  progressFill: $('progressFill'),
  playStatus: $('playStatus'),
};

init();

async function init() {
  wireOnboarding();
  wireControls();
  wireHeroAutoFit();
  renderTicks(el.progressTicks, 0, 48);
  renderTicks(el.sleepTicks, 0, 28);
  renderVibeScales();

  try {
    const data = await fetchJSON('/api/contexts');
    contexts = data.contexts || [];
    state.contextId = contexts[0]?.id || null;
    renderScenarios();
    renderContext(getActiveContext());
  } catch (error) {
    setDjLine(`Could not load contexts: ${error.message}`);
  }

  surfaceAuthError();
  await loadSession();
  el.userNameInput?.focus();
  scheduleFit();
}

// Scale the hero "Pick a Set" content to whatever vertical space the tile gets,
// so the transport controls and Play button never clip on shorter viewports.
let fitScheduled = false;
function scheduleFit() {
  if (fitScheduled) return;
  fitScheduled = true;
  requestAnimationFrame(() => {
    fitScheduled = false;
    fitHero();
  });
}

function fitHero() {
  const body = el.heroBody;
  const tile = el.heroTile;
  if (!body || !tile || tile.offsetParent === null) return; // skip while hidden

  // Measure with content top-anchored so scrollHeight captures the full natural
  // height (centered overflow would under-report it).
  body.style.transform = 'none';
  tile.classList.add('is-fitted');

  const avail = body.clientHeight;
  const natural = body.scrollHeight;
  if (!avail || !natural) {
    tile.classList.remove('is-fitted');
    return;
  }

  const scale = Math.max(0.6, Math.min(1, (avail / natural) * 0.985));
  if (scale < 0.999) {
    body.style.transform = `scale(${scale})`; // keep top-anchored while scaled
  } else {
    tile.classList.remove('is-fitted'); // fits as-is: restore centered layout
    body.style.transform = '';
  }
}

function wireHeroAutoFit() {
  if (typeof ResizeObserver !== 'undefined' && el.heroTile) {
    new ResizeObserver(() => scheduleFit()).observe(el.heroTile);
  }
  window.addEventListener('resize', scheduleFit);
  document.fonts?.ready?.then(() => scheduleFit());
}

function wireOnboarding() {
  el.nameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    startSignalSetup();
  });
  el.enterDemoButton.addEventListener('click', finishOnboarding);
}

async function startSignalSetup() {
  demoUserName = cleanName(el.userNameInput.value) || 'Jasmine';
  renderContext(getActiveContext());
  setOnboardingStep('connect');
  el.beginSetupButton.disabled = true;
  el.enterDemoButton.disabled = true;
  resetConnector(el.watchConnector, 'Waiting');
  resetConnector(el.calendarConnector, 'Waiting');
  resetConnector(el.weatherConnector, 'Waiting');

  el.setupTitle.textContent = `Nice to meet you, ${demoUserName}.`;
  el.setupDetail.textContent = 'Asking permission to read the signals that will shape this music set.';

  await connectSignal(el.watchConnector, 'Apple Watch connected', 'Heart rate elevated, sleep short, stress very high.');
  await connectSignal(el.calendarConnector, 'Google Calendar connected', 'Pitch practice found at 10:00 AM.');
  await connectSignal(el.weatherConnector, 'Weather connected', `${taipeiClockLabel()} · Taipei forecast loaded.`);

  el.setupTitle.textContent = 'All signals connected.';
  el.setupDetail.textContent =
    'The demo will open on a pitch-practice moment for a founder who needs calm, focus, and confidence before rehearsing.';
  el.enterDemoButton.disabled = false;
}

function finishOnboarding() {
  el.onboardingFlow.hidden = true;
  el.app.classList.add('demo-ready');
  scheduleFit();
  renderContext(getActiveContext());
  const context = personalizeContext(getActiveContext());
  setDjLine(
    `${greetingHeadline(context)} Apple Watch, Google Calendar, and Taipei weather are connected. Tap Play to see how the data shapes the set.`
  );
}

function setOnboardingStep(step) {
  el.onboardingFlow.dataset.step = step;
  document.querySelectorAll('[data-onboarding-step]').forEach((panel) => {
    const active = panel.dataset.onboardingStep === step;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
}

async function connectSignal(card, label, detail) {
  resetConnector(card, 'Authorizing');
  el.setupDetail.textContent = detail;
  await delay(720);
  card.classList.add('connected');
  card.querySelector('i').textContent = label;
  await delay(520);
}

function resetConnector(card, label) {
  card.classList.remove('connected');
  card.querySelector('i').textContent = label;
}

function wireControls() {
  el.playSessionButton.addEventListener('click', () => startPlaySession());
  el.playButton.addEventListener('click', () => handlePrimaryPlayback());
  el.energyButton.addEventListener('click', () => selectNextTrack());
  el.smoothButton.addEventListener('click', () => selectPreviousTrack());
  el.reshuffleButton.addEventListener('click', () => recommend('play_something_else'));
  el.keepButton.addEventListener('click', () => recommend('keep_this_vibe'));
  el.simulatorToggle.addEventListener('click', () => el.contextMenu.classList.toggle('open'));
  el.togglePlay.addEventListener('click', () => togglePlayback());
}

// Single "Play" action: pull a fresh Spotify-grounded set, then start playback immediately.
async function startPlaySession() {
  await recommend('play_something');
  if (currentCard) playTrack(currentCard);
}

function getActiveContext() {
  return contexts.find((context) => context.id === state.contextId) || contexts[0] || null;
}

function renderScenarios() {
  el.scenarioList.replaceChildren();

  contexts.forEach((profile) => {
    const button = document.createElement('button');
    button.className = `scenario-button ${profile.id === state.contextId ? 'active' : ''}`;
    button.type = 'button';
    button.dataset.id = profile.id;

    const label = document.createElement('strong');
    label.textContent = profile.label;
    const summary = document.createElement('span');
    summary.textContent = profile.summary || contextSummary(profile);
    button.append(label, summary);

    button.addEventListener('click', () => {
      state.contextId = profile.id;
      state.exclude = [];
      state.currentMission = null;
      currentCard = null;
      currentSetData = null;
      currentSet = [];
      currentIndex = -1;
      lastArtist = null;
      renderContext(profile);
      renderScenarios();
      resetRecommendation();
      el.contextMenu.classList.remove('open');
    });

    el.scenarioList.appendChild(button);
  });
}

function renderContext(context) {
  if (!context) return;
  const displayContext = personalizeContext(context);

  el.contextLabel.textContent = displayContext.label;
  el.energyValue.textContent = displayContext.energyLevel;
  el.sleepValue.textContent = displayContext.sleepQuality;
  el.stressValue.textContent = displayContext.stressLevel;
  el.weatherCondition.textContent = getWeatherCondition(displayContext.weather);
  el.tempValue.textContent = displayContext.rainChance ?? '--';
  el.locationValue.textContent = displayContext.location;
  el.scheduleValue.textContent = `${displayContext.schedule} · ${taipeiClockLabel()}`;
  el.greetingTitle.textContent = greetingHeadline(displayContext);

  renderDots(el.energyDots, (displayContext.energyLevel || 0) / 100, 158);
  renderDots(el.stressDots, (displayContext.stressLevel || 0) / 100, 18);
  renderTicks(el.sleepTicks, (displayContext.sleepQuality || 0) / 100, 28);
  el.energyHint.textContent = getEnergyHint(displayContext.energyLevel);
  el.sleepHint.textContent = getSleepHint(displayContext.sleepQuality);
  el.stressHint.textContent = getStressHint(displayContext.stressLevel);
}

function resetRecommendation() {
  el.missionLabel.textContent = 'Ready';
  el.trackTitle.textContent = 'Pick a Set';
  el.trackArtist.textContent = 'Sonicstride';
  el.bpmValue.textContent = '--';
  el.trackMeta.textContent = 'Context-aware recommendations are ready.';
  el.scoreInsight.textContent = '--';
  el.elapsedTime.textContent = '0:00';
  el.remainingTime.textContent = '--:--';
  el.playButton.textContent = 'PLAY';
  el.togglePlay.textContent = 'PLAY';
  playbackActive = false;
  currentSetData = null;
  currentSet = [];
  currentIndex = -1;
  setDjLine('Choose a context, then tap Play and I will read the room.');
  el.reasonInsight.textContent = 'Tap Play and I will explain the sound profile here.';
  el.upNextList.replaceChildren();
  renderVibeScales();
  renderWhyRows([]);
  renderAlbum();
  scheduleFit();
}

async function recommend(action) {
  if (isLoading || !state.contextId) return;

  const loadingStartedAt = Date.now();
  setLoading(true, action);
  try {
    const context = personalizeContext(getActiveContext());
    const data = await fetchJSON('/api/recommend', {
      contextId: state.contextId,
      context,
      action,
      exclude: state.exclude,
      currentMission: state.currentMission,
      lastArtist,
    });
    renderRecommendation(data, action);
  } catch (error) {
    setDjLine(`Recommendation failed: ${error.message}`);
  } finally {
    const remainingLoadingTime = MIN_ANALYSIS_LOADING_MS - (Date.now() - loadingStartedAt);
    if (remainingLoadingTime > 0) await delay(remainingLoadingTime);
    setLoading(false);
  }
}

function renderRecommendation(data, action) {
  const card = data.recommendation;
  if (!card) {
    setDjLine('No recommendation came back for this context.');
    return;
  }

  currentSetData = data;
  currentSet = uniqueCards([card, ...(data.backups || [])]);
  currentIndex = 0;
  state.currentMission = data.mission?.id || null;
  renderCurrentSelection({ updateExplanation: true });
}

function renderCurrentSelection({ updateExplanation = false, announcement = '' } = {}) {
  if (!currentSetData || currentIndex < 0 || !currentSet[currentIndex]) return;

  const data = currentSetData;
  const card = currentSet[currentIndex];
  currentCard = card;
  lastArtist = card.artist;
  rememberTrack(card);

  el.app.classList.remove('is-thinking');
  el.app.classList.add('is-playing');
  el.missionEyebrow.textContent = data.ai?.mode === 'ai-grounded' ? 'AI-grounded mission' : 'Fallback mission';
  el.missionLabel.textContent = data.mission?.label || 'Smart Set';
  el.trackTitle.textContent = card.title;
  el.trackArtist.textContent = card.artist;
  el.bpmValue.textContent = bpmValue(card);
  el.trackMeta.textContent = trackMeta(card);
  el.scoreInsight.textContent = card.matchScore ?? '--';
  el.elapsedTime.textContent = '0:00';
  el.remainingTime.textContent = durationLabel(card.durationMs);

  if (announcement) {
    setDjLine(announcement);
  } else if (updateExplanation) {
    setDjLine(data.dj?.line || card.reason || 'I found a track that fits this moment.');
  }
  el.reasonInsight.textContent = [data.mission?.reason, card.reason].filter(Boolean).join(' ');
  el.featureSource.textContent = card.featureSource === 'ai-estimate' ? 'AI-estimated features' : 'catalog features';

  renderAlbum(card);
  renderTicks(el.progressTicks, 0, 48);
  renderVibeScales(card.predicted, data.targetProfile);
  renderWhyRows(whyRows(data));
  renderUpNext(currentSet.slice(currentIndex + 1));
  el.whyPanel.hidden = false;
  scheduleFit();
}

function selectNextTrack() {
  if (!currentSet.length) {
    setDjLine('Tap Play first so I have a set to move through.');
    return;
  }
  if (currentIndex >= currentSet.length - 1) {
    setDjLine('That is the end of this set. Tap Play for a fresh read.');
    return;
  }

  currentIndex += 1;
  renderCurrentSelection({ announcement: `Next up: "${currentSet[currentIndex].title}" by ${currentSet[currentIndex].artist}.` });
  if (playbackActive) playTrack(currentCard);
}

function selectPreviousTrack() {
  if (!currentSet.length) {
    setDjLine('Tap Play first so I have a set history to move through.');
    return;
  }
  if (currentIndex <= 0) {
    setDjLine('You are at the first track in this set.');
    return;
  }

  currentIndex -= 1;
  renderCurrentSelection({ announcement: `Back to: "${currentSet[currentIndex].title}" by ${currentSet[currentIndex].artist}.` });
  if (playbackActive) playTrack(currentCard);
}

function uniqueCards(cards) {
  const seen = new Set();
  return cards.filter((card) => {
    const key = normalizeCardKey(card);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCardKey(card) {
  return String(card?.id || `${card?.title || ''} ${card?.artist || ''}`)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rememberTrack(card) {
  const tag = `${card.title} - ${card.artist}`;
  if (!state.exclude.includes(tag)) state.exclude.push(tag);
  if (state.exclude.length > 10) state.exclude.shift();
}

function renderAlbum(card) {
  el.albumArt.classList.toggle('has-image', Boolean(card));
  const src = safeImageSrc(card?.albumArt);
  if (src) {
    el.albumArt.style.backgroundImage = `url("${src}")`;
    return;
  }

  const seed = card ? hashHue(`${card.title}${card.artist}`) : 168;
  el.albumArt.style.backgroundImage =
    `radial-gradient(circle at 50% 52%, hsl(${seed} 82% 58% / 0.95), ` +
    `hsl(${(seed + 22) % 360} 70% 30% / 0.72) 42%, ` +
    `hsl(${(seed + 20) % 360} 70% 18% / 0.8) 100%)`;
}

function renderVibeScales(predicted = null, target = null) {
  el.vibeScaleGrid.replaceChildren();
  const rows = [
    ['Energy', predicted?.energy, target?.energy],
    ['Positivity', predicted?.valence, target?.valence],
    ['Dance', predicted?.danceability, target?.danceability],
    ['Vocals', predicted?.vocalDensity, target?.vocalDensity],
    ['Acoustic', predicted?.acousticness, target?.acousticness],
  ];

  rows.forEach(([label, value, targetValue]) => {
    el.vibeScaleGrid.appendChild(vibeRow(label, value, targetValue));
  });

  const bpm = Array.isArray(target?.tempoBpm) ? `${target.tempoBpm[0]}-${target.tempoBpm[1]}` : target?.tempoBpm;
  if (bpm) {
    const chip = document.createElement('span');
    chip.className = 'bpm-chip';
    chip.textContent = `Target ${bpm} BPM`;
    el.vibeScaleGrid.appendChild(chip);
  }
}

function vibeRow(label, value = 0, targetValue = null) {
  const row = document.createElement('div');
  row.className = 'vibe-row';

  const text = document.createElement('span');
  text.textContent = label;

  const scale = document.createElement('div');
  scale.className = 'vibe-scale';
  const fill = document.createElement('i');
  fill.style.setProperty('--w', `${percent(value)}%`);
  scale.appendChild(fill);

  if (typeof targetValue === 'number') {
    const marker = document.createElement('b');
    marker.style.setProperty('--x', `${percent(targetValue)}%`);
    scale.appendChild(marker);
  }

  const number = document.createElement('strong');
  number.className = 'led';
  number.textContent = String(percent(value)).padStart(2, '0');

  row.append(text, scale, number);
  return row;
}

function renderWhyRows(rows) {
  el.whyGrid.replaceChildren();

  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'why-row';

    const text = document.createElement('span');
    text.textContent = label;
    const bar = document.createElement('div');
    bar.className = 'why-bar';
    const fill = document.createElement('i');
    fill.style.setProperty('--w', `${percent(value)}%`);
    bar.appendChild(fill);
    const number = document.createElement('b');
    number.className = 'led';
    number.textContent = percent(value);

    row.append(text, bar, number);
    el.whyGrid.appendChild(row);
  });
}

function whyRows(data) {
  const profile = data.targetProfile || {};
  const stateData = data.state || {};
  return [
    ['Target energy', profile.energy],
    ['Target mood', profile.valence],
    ['Acousticness', profile.acousticness],
    ['Danceability', profile.danceability],
    ['Lyric density', profile.vocalDensity],
    ['Context risk', stateData.contextRisk === 'elevated' ? 0.85 : 0.35],
  ].filter(([, value]) => typeof value === 'number');
}

function renderUpNext(items) {
  el.upNextList.replaceChildren();

  items.forEach((card) => {
    const row = document.createElement('article');
    row.className = 'upnext-row';
    row.style.setProperty('--row-h', hashHue(`${card.title}${card.artist}`));

    const art = document.createElement('div');
    art.className = 'mini-art';
    const src = safeImageSrc(card.albumArt);
    if (src) art.style.backgroundImage = `url("${src}")`;

    const copy = document.createElement('div');
    copy.className = 'upnext-copy';
    const title = document.createElement('strong');
    title.textContent = card.title;
    const artist = document.createElement('span');
    artist.textContent = card.artist;
    copy.append(title, artist);

    const bpm = document.createElement('div');
    bpm.className = 'upnext-bpm';
    const bpmNum = document.createElement('span');
    bpmNum.className = 'led';
    bpmNum.textContent = bpmValue(card);
    const bpmUnit = document.createElement('span');
    bpmUnit.textContent = 'BPM';
    bpm.append(bpmNum, bpmUnit);

    row.append(art, copy, bpm);
    row.addEventListener('click', () => {
      const index = currentSet.findIndex((candidate) => normalizeCardKey(candidate) === normalizeCardKey(card));
      if (index >= 0) currentIndex = index;
      renderCurrentSelection({ announcement: `Selected: "${card.title}" by ${card.artist}.` });
      if (playbackActive) playTrack(card);
    });
    el.upNextList.appendChild(row);
  });
}

async function loadSession() {
  try {
    session = await fetchJSON('/api/session');
  } catch {
    session = { loggedIn: false };
  }
  renderAuth();
  if (session.loggedIn) initPlayer();
}

function renderAuth() {
  el.spotifyAuth.replaceChildren();

  if (session.loggedIn) {
    const name = session.profile?.display_name || 'Spotify';
    const plan = session.profile?.product === 'premium' ? 'Premium' : 'Free';
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = `${name} / ${plan}`;
    const logout = document.createElement('button');
    logout.className = 'glass-control small-pill auth-pill';
    logout.type = 'button';
    logout.textContent = 'Log out';
    logout.onclick = async () => {
      await fetch('/api/logout', { method: 'POST' });
      location.href = '/';
    };
    el.spotifyAuth.append(who, logout);
    return;
  }

  const connect = document.createElement('button');
  connect.className = 'glass-control small-pill auth-pill';
  connect.type = 'button';
  connect.textContent = 'Connect Spotify';
  connect.onclick = () => (location.href = '/login');
  el.spotifyAuth.appendChild(connect);
}

window.onSpotifyWebPlaybackSDKReady = () => {
  if (session.loggedIn) initPlayer();
};

function initPlayer() {
  if (player || !window.Spotify || !session.accessToken) return;

  player = new Spotify.Player({
    name: 'Sonicstride Player',
    getOAuthToken: (cb) => cb(session.accessToken),
    volume: 0.6,
  });
  player.addListener('ready', ({ device_id }) => (deviceId = device_id));
  player.addListener('not_ready', () => (deviceId = null));
  player.addListener('account_error', () =>
    setPlayStatus('Spotify Premium required for in-app playback; previews or links still work.')
  );
  player.addListener('player_state_changed', (s) => {
    if (!s || !s.track_window?.current_track) return;
    const t = s.track_window.current_track;
    el.playbar.hidden = false;
    el.nowPlaying.textContent = `${t.name} / ${t.artists.map((a) => a.name).join(', ')}`;
    setPlaybackActive(!s.paused);
    const pct = s.duration ? (s.position / s.duration) * 100 : 0;
    el.progressFill.style.width = `${pct}%`;
    setPlayStatus(s.paused ? 'Paused' : 'Playing full track in app');
  });
  player.connect();
}

async function playTrack(card = currentCard) {
  if (!card) {
    setDjLine('Tap Play first so I can pick a track for this context.');
    el.reasonInsight.textContent = 'No set has been selected yet. Play reads the room and starts the music.';
    return;
  }

  stopPreview();
  el.playbar.hidden = false;
  el.nowPlaying.textContent = `${card.title} / ${card.artist}`;
  el.progressFill.style.width = '0%';

  const premium = session.profile?.product === 'premium';
  if (premium && card.spotifyUri) {
    const readyDevice = deviceId || (await waitForDevice());
    if (readyDevice) {
      const r = await fetch('/api/play', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: card.spotifyUri, deviceId: readyDevice }),
      });
      if (r.ok) {
        setPlaybackActive(true);
        setPlayStatus('Playing full track in app');
        return;
      }
      setPlayStatus('Spotify playback failed; try the Open Spotify link.');
    } else {
      setPlayStatus('Spotify player is still connecting. Try Play again in a moment.');
    }
  } else if (!session.loggedIn) {
    setPlayStatus('Connect Spotify Premium for full in-app playback.');
  }

  if (card.previewUrl) {
    previewAudio = new Audio(card.previewUrl);
    previewAudio.volume = 0.7;
    previewAudio.onplay = () => setPlaybackActive(true);
    previewAudio.onpause = () => setPlaybackActive(false);
    previewAudio.onended = () => setPlaybackActive(false);
    previewAudio.ontimeupdate = () => {
      const pct = previewAudio.duration ? (previewAudio.currentTime / previewAudio.duration) * 100 : 0;
      el.progressFill.style.width = `${pct}%`;
    };
    await previewAudio.play();
    setPlayStatus('Playing 30s preview');
    return;
  }

  setPlayStatus('No in-app playback source is ready. Use Open Spotify if you want to jump out.');
}

function handlePrimaryPlayback() {
  if (playbackActive || previewAudio) return togglePlayback();
  return playTrack();
}

async function waitForDevice(timeoutMs = 3500) {
  if (deviceId) return deviceId;
  if (!player && window.Spotify && session.accessToken) initPlayer();

  const startedAt = Date.now();
  while (!deviceId && Date.now() - startedAt < timeoutMs) {
    setPlayStatus('Connecting Spotify player...');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return deviceId;
}

function togglePlayback() {
  if (player && deviceId) return player.togglePlay();
  if (!previewAudio) return playTrack();
  if (previewAudio.paused) previewAudio.play();
  else previewAudio.pause();
}

function stopPreview() {
  if (!previewAudio) return;
  previewAudio.pause();
  previewAudio = null;
  setPlaybackActive(false);
}

function setPlaybackActive(active) {
  playbackActive = active;
  const label = active ? 'PAUSE' : 'PLAY';
  el.playButton.textContent = label;
  el.togglePlay.textContent = label;
}

function setLoading(on, action = '') {
  isLoading = on;
  el.app.classList.toggle('is-thinking', on);
  el.analysisOverlay.hidden = !on;
  [el.playSessionButton, el.energyButton, el.smoothButton, el.keepButton, el.reshuffleButton].forEach(
    (button) => (button.disabled = on)
  );
  if (on) {
    const context = personalizeContext(getActiveContext());
    const greeting = analysisGreeting(context);
    const detail = analysisDetail(context);
    el.analysisGreeting.textContent = greeting;
    el.analysisDetail.textContent = detail;
    setDjLine(`${greeting} ${detail}`);
  } else {
    scheduleFit();
  }
}

function analysisGreeting(context) {
  const name = context?.userName || 'there';
  const time = context?.timeOfDay || '';
  if (/morning/i.test(time)) return `Good morning, ${name}. I am reading the room.`;
  if (/afternoon/i.test(time)) return `Good afternoon, ${name}. I am reading the room.`;
  if (/evening|night/i.test(time)) return `Good evening, ${name}. I am shaping the next set.`;
  return `Hey ${name}. I am reading the room.`;
}

function greetingHeadline(context) {
  const name = context?.userName || 'there';
  const time = context?.timeOfDay || '';
  if (/morning/i.test(time)) return `Good morning, ${name}.`;
  if (/afternoon/i.test(time)) return `Good afternoon, ${name}.`;
  if (/evening|night/i.test(time)) return `Good evening, ${name}.`;
  return `Hey ${name}.`;
}

function personalizeContext(context) {
  if (!context) return null;
  return {
    ...context,
    userName: demoUserName || context.userName || 'there',
    timeOfDay: taipeiTimeOfDay(),
  };
}

function cleanName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 32);
}

function taipeiTimeOfDay() {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Taipei',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
  );
  if (hour >= 5 && hour < 12) return 'Taipei morning';
  if (hour >= 12 && hour < 18) return 'Taipei afternoon';
  if (hour >= 18 && hour < 22) return 'Taipei evening';
  return 'Taipei night';
}

function taipeiClockLabel() {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
  return `${time} Taipei time`;
}

function analysisDetail(context) {
  const signals = [
    context?.energyLevel != null ? `energy ${context.energyLevel}` : null,
    context?.sleepQuality != null ? `sleep ${context.sleepQuality}` : null,
    context?.stressLevel != null ? `stress ${context.stressLevel}` : null,
    context?.weather || null,
    context?.schedule || null,
  ].filter(Boolean);
  return `Checking ${signals.join(', ')} and matching the vibe before I pick the next track.`;
}

function setDjLine(text) {
  el.djLine.textContent = text;
}

function setPlayStatus(text) {
  el.playStatus.textContent = text;
}

function renderDots(container, value, hue) {
  const count = 12;
  const on = Math.round(clamp(value, 0, 1) * count);
  container.style.setProperty('--dot-h', hue);
  container.replaceChildren();
  Array.from({ length: count }, (_, index) => {
    const dot = document.createElement('i');
    if (index < on) dot.className = 'on';
    container.appendChild(dot);
  });
}

function renderTicks(container, value, count) {
  container.style.setProperty('--value', clamp(value, 0, 1));
  container.replaceChildren();
  Array.from({ length: count }, (_, index) => {
    const tick = document.createElement('i');
    if (index % 5 === 0) tick.className = 'major';
    container.appendChild(tick);
  });
}

function bpmValue(card) {
  return Math.round(card?.predicted?.tempoBpm || 0) || '--';
}

function trackMeta(card) {
  const predicted = card.predicted || {};
  const energy = percent(predicted.energy);
  const positivity = percent(predicted.valence);
  const parts = [`Energy ${energy}`, `Positivity ${positivity}`];
  if (card.year) parts.push(card.year);
  if (card.explicit) parts.push('Explicit');
  return parts.join(' / ');
}

function durationLabel(ms) {
  if (!ms) return '--:--';
  return `-${formatDuration(Math.round(ms / 1000))}`;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

function contextSummary(context) {
  return [context.weather, context.schedule, context.timeOfDay].filter(Boolean).join(' / ');
}

function getWeatherCondition(weather = '') {
  if (/shower/i.test(weather)) return 'Showers';
  if (/rain/i.test(weather)) return 'Rainy';
  if (/partly/i.test(weather)) return 'Partly cloudy';
  if (/gloom|cloud/i.test(weather)) return 'Gloomy';
  if (/clear|sun/i.test(weather)) return 'Clear';
  if (/storm/i.test(weather)) return 'Stormy';
  return weather.split(',')[0] || 'Weather';
}

function getEnergyHint(value = 0) {
  if (value >= 85) return 'Running high';
  if (value >= 65) return 'Ready';
  if (value >= 42) return 'Steady';
  return 'Low glow';
}

function getSleepHint(value = 0) {
  if (value >= 78) return 'Well rested';
  if (value >= 55) return 'Enough';
  if (value >= 35) return 'Lighter than usual';
  return 'Soft start';
}

function getStressHint(value = 0) {
  if (value >= 70) return 'Needs space';
  if (value >= 50) return 'A little edge';
  return 'Easy';
}

function percent(value = 0) {
  return Math.round(clamp(Number(value) || 0, 0, 1) * 100);
}

function hashHue(value) {
  let hash = 0;
  for (const char of String(value || 'sonicstride')) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeSpotifyHref(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname === 'open.spotify.com' ? u.href : '#';
  } catch {
    return '#';
  }
}

function safeImageSrc(value) {
  if (!value) return '';
  try {
    const u = new URL(value);
    if (u.protocol === 'https:') return u.href;
    if (u.protocol === 'data:' && u.href.startsWith('data:image/svg+xml;utf8,')) return u.href;
  } catch {
    return '';
  }
  return '';
}

function surfaceAuthError() {
  const err = new URLSearchParams(location.search).get('error');
  if (err) setPlayStatus(`Spotify: ${err}`);
}

async function fetchJSON(url, body) {
  const opts = body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {};
  const r = await fetch(url, opts);
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.detail || data.error || r.status);
  }
  return r.json();
}
