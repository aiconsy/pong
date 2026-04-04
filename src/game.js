export const CANVAS_W = 800;
export const CANVAS_H = 500;

const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5;
const BALL_SPEED_INIT = 4;
const BALL_SPEED_INCREMENT = 0.3;
const AI_SPEED = 3.5;
const WINNING_SCORE = 5;

export function createState() {
  return {
    player: { x: 20, y: CANVAS_H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H, dy: 0 },
    ai: { x: CANVAS_W - 20 - PADDLE_W, y: CANVAS_H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H },
    ball: { x: CANVAS_W / 2, y: CANVAS_H / 2, vx: BALL_SPEED_INIT, vy: BALL_SPEED_INIT, size: BALL_SIZE },
    score: { player: 0, ai: 0 },
    running: false,
    winner: null,
  };
}

export function resetBall(state, direction = 1) {
  state.ball.x = CANVAS_W / 2;
  state.ball.y = CANVAS_H / 2;
  const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8;
  const speed = BALL_SPEED_INIT + (state.score.player + state.score.ai) * BALL_SPEED_INCREMENT;
  state.ball.vx = Math.cos(angle) * speed * direction;
  state.ball.vy = Math.sin(angle) * speed;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function rectCollision(ball, paddle) {
  return (
    ball.x - ball.size / 2 < paddle.x + paddle.w &&
    ball.x + ball.size / 2 > paddle.x &&
    ball.y - ball.size / 2 < paddle.y + paddle.h &&
    ball.y + ball.size / 2 > paddle.y
  );
}

export function update(state) {
  if (!state.running || state.winner) return;

  const { player, ai, ball, score } = state;

  player.y = clamp(player.y + player.dy * PADDLE_SPEED, 0, CANVAS_H - player.h);

  const aiCenter = ai.y + ai.h / 2;
  if (aiCenter < ball.y - 10) ai.y += AI_SPEED;
  else if (aiCenter > ball.y + 10) ai.y -= AI_SPEED;
  ai.y = clamp(ai.y, 0, CANVAS_H - ai.h);

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.size / 2 <= 0 || ball.y + ball.size / 2 >= CANVAS_H) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.size / 2, CANVAS_H - ball.size / 2);
  }

  if (rectCollision(ball, player)) {
    ball.vx = Math.abs(ball.vx);
    const hitPos = (ball.y - (player.y + player.h / 2)) / (player.h / 2);
    ball.vy += hitPos * 2;
    ball.x = player.x + player.w + ball.size / 2;
  }

  if (rectCollision(ball, ai)) {
    ball.vx = -Math.abs(ball.vx);
    const hitPos = (ball.y - (ai.y + ai.h / 2)) / (ai.h / 2);
    ball.vy += hitPos * 2;
    ball.x = ai.x - ball.size / 2;
  }

  if (ball.x < 0) {
    score.ai++;
    if (score.ai >= WINNING_SCORE) {
      state.winner = 'ai';
      state.running = false;
    } else {
      resetBall(state, 1);
    }
  }
  if (ball.x > CANVAS_W) {
    score.player++;
    if (score.player >= WINNING_SCORE) {
      state.winner = 'player';
      state.running = false;
    } else {
      resetBall(state, -1);
    }
  }
}

export function draw(ctx, state) {
  const { player, ai, ball } = state;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = '#334';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2, 0);
  ctx.lineTo(CANVAS_W / 2, CANVAS_H);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#0f3460';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillRect(ai.x, ai.y, ai.w, ai.h);

  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
  ctx.fill();

  if (state.winner) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.winner === 'player' ? 'You Win!' : 'AI Wins!', CANVAS_W / 2, CANVAS_H / 2 - 10);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Press Space to play again', CANVAS_W / 2, CANVAS_H / 2 + 30);
  } else if (!state.running) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#eee';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press Space to Start', CANVAS_W / 2, CANVAS_H / 2);
  }
}
