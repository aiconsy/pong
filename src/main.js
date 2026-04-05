import { createState, resetBall, update, draw, CANVAS_W, CANVAS_H } from './game.js';

const canvas = document.getElementById('game-canvas');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');

let state = createState();

const pauseOverlayEl = document.getElementById('pause-overlay');

const stationSelectEl = document.getElementById('station-select');
const stationUrlEl = document.getElementById('station-url');
const stationLoadEl = document.getElementById('station-load');
const radioAudioEl = document.getElementById('radio-audio');
const radioStatusEl = document.getElementById('radio-status');

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

function setPaused(enabled) {
  paused = enabled;
  pauseOverlayEl.setAttribute('aria-hidden', enabled ? 'false' : 'true');
  pauseOverlayEl.classList.toggle('visible', enabled);
  if (enabled) {
    resumeRunningAfterPause = state.running;
    state.running = false;
  } else if (resumeRunningAfterPause) {
    state.running = true;
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
