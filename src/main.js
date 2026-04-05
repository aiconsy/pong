import { createState, resetBall, update, draw, CANVAS_W, CANVAS_H } from './game.js';

const canvas = document.getElementById('game-canvas');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');

let state = createState();

const pauseOverlayEl = document.getElementById('pause-overlay');
const themeSelectEl = document.getElementById('theme-select');
const levelSelectEl = document.getElementById('level-select');

const stationSelectEl = document.getElementById('station-select');
const stationUrlEl = document.getElementById('station-url');
const stationLoadEl = document.getElementById('station-load');
const radioAudioEl = document.getElementById('radio-audio');
const radioStatusEl = document.getElementById('radio-status');

const THEME_STORAGE_KEY = 'pong:theme';
const LEVEL_STORAGE_KEY = 'pong:level';

const themes = [
  { id: 'dark', name: 'Dark (default)' },
  { id: 'light', name: 'Light' },
  { id: 'terminal', name: 'Terminal green' },
  { id: 'midnight', name: 'Midnight neon' },
];

const levels = [
  { id: 'doing_just_enough', name: 'Doing just enough', speed: 0.85 },
  { id: 'in_a_meeting', name: 'In a meeting', speed: 1.0 },
  { id: 'deep_work', name: 'Deep work', speed: 1.25 },
  { id: 'productivity_theater', name: 'Productivity theater', speed: 1.6 },
];

function applyTheme(themeId) {
  const resolved = themes.some((t) => t.id === themeId) ? themeId : 'dark';
  document.documentElement.setAttribute('data-theme', resolved);
  localStorage.setItem(THEME_STORAGE_KEY, resolved);
}

function applyLevel(levelId) {
  const level = levels.find((l) => l.id === levelId) ?? levels[1];
  state.speedMultiplier = level.speed;
  localStorage.setItem(LEVEL_STORAGE_KEY, level.id);
}

function populateSelect(selectEl, options) {
  selectEl.innerHTML = '';
  for (const optData of options) {
    const opt = document.createElement('option');
    opt.value = optData.id;
    opt.textContent = optData.name;
    selectEl.appendChild(opt);
  }
}

populateSelect(themeSelectEl, themes);
populateSelect(levelSelectEl, levels);

const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
themeSelectEl.value = storedTheme;
applyTheme(storedTheme);

const storedLevel = localStorage.getItem(LEVEL_STORAGE_KEY) || 'in_a_meeting';
levelSelectEl.value = storedLevel;
applyLevel(storedLevel);

themeSelectEl.addEventListener('change', () => applyTheme(themeSelectEl.value));
levelSelectEl.addEventListener('change', () => applyLevel(levelSelectEl.value));

const stations = [
  { name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
];

function setRadioStatus(text) {
  radioStatusEl.textContent = text;
}

function loadStation(url) {
  const cleaned = (url ?? '').trim();
  if (!cleaned) {
    setRadioStatus('Enter a stream URL.');
    return;
  }
  radioAudioEl.src = cleaned;
  radioAudioEl.load();
  setRadioStatus('Loaded. Press play.');
}

function populateStations() {
  stationSelectEl.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Choose…';
  stationSelectEl.appendChild(placeholder);

  for (const s of stations) {
    const opt = document.createElement('option');
    opt.value = s.url;
    opt.textContent = s.name;
    stationSelectEl.appendChild(opt);
  }
}

populateStations();
setRadioStatus('Pick a station or paste a stream URL.');

stationSelectEl.addEventListener('change', () => {
  const url = stationSelectEl.value;
  if (url) loadStation(url);
});
stationLoadEl.addEventListener('click', () => loadStation(stationUrlEl.value));
stationUrlEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    loadStation(stationUrlEl.value);
  }
});

radioAudioEl.addEventListener('playing', () => setRadioStatus('Playing.'));
radioAudioEl.addEventListener('pause', () => setRadioStatus('Paused.'));
radioAudioEl.addEventListener('error', () => setRadioStatus('Failed to load stream (CORS/network). Try another URL.'));

let paused = false;
let resumeRunningAfterPause = false;
let resumeRadioAfterPause = false;

function setPaused(enabled) {
  paused = enabled;
  pauseOverlayEl.setAttribute('aria-hidden', enabled ? 'false' : 'true');
  pauseOverlayEl.classList.toggle('visible', enabled);
  if (enabled) {
    resumeRunningAfterPause = state.running;
    state.running = false;
    resumeRadioAfterPause = !radioAudioEl.paused;
    if (resumeRadioAfterPause) radioAudioEl.pause();
  } else if (resumeRunningAfterPause) {
    state.running = true;
    if (resumeRadioAfterPause) {
      void radioAudioEl.play().catch(() => {
        // Autoplay policies may block; user can press play manually.
      });
    }
  }
}

const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    if (state.winner) {
      state = createState();
      state.running = true;
      resetBall(state, 1);
    } else if (!state.running) {
      state.running = true;
      resetBall(state, 1);
    }
  }
  if (e.key === 'Enter') {
    if (document.activeElement === stationUrlEl) return;
    if (state.winner) return;
    setPaused(!paused);
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function gameLoop() {
  if (keys['w'] || keys['W'] || keys['ArrowUp']) state.player.dy = -1;
  else if (keys['s'] || keys['S'] || keys['ArrowDown']) state.player.dy = 1;
  else state.player.dy = 0;

  update(state);
  draw(ctx, state);

  playerScoreEl.textContent = state.score.player;
  aiScoreEl.textContent = state.score.ai;

  requestAnimationFrame(gameLoop);
}

gameLoop();
