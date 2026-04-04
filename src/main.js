import { createState, resetBall, update, draw, CANVAS_W, CANVAS_H } from './game.js';

const canvas = document.getElementById('game-canvas');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');

let state = createState();

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
