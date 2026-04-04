import { describe, it, expect } from 'vitest';
import { createState, resetBall, update, CANVAS_W, CANVAS_H } from './game.js';

describe('createState', () => {
  it('returns a valid initial state', () => {
    const s = createState();
    expect(s.score.player).toBe(0);
    expect(s.score.ai).toBe(0);
    expect(s.running).toBe(false);
    expect(s.winner).toBeNull();
    expect(s.ball.x).toBe(CANVAS_W / 2);
    expect(s.ball.y).toBe(CANVAS_H / 2);
  });
});

describe('resetBall', () => {
  it('places ball at center', () => {
    const s = createState();
    s.ball.x = 100;
    s.ball.y = 100;
    resetBall(s, 1);
    expect(s.ball.x).toBe(CANVAS_W / 2);
    expect(s.ball.y).toBe(CANVAS_H / 2);
  });

  it('gives ball velocity in specified direction', () => {
    const s = createState();
    resetBall(s, 1);
    expect(s.ball.vx).toBeGreaterThan(0);

    resetBall(s, -1);
    expect(s.ball.vx).toBeLessThan(0);
  });
});

describe('update', () => {
  it('does nothing when not running', () => {
    const s = createState();
    const origX = s.ball.x;
    update(s);
    expect(s.ball.x).toBe(origX);
  });

  it('moves ball when running', () => {
    const s = createState();
    s.running = true;
    const origX = s.ball.x;
    update(s);
    expect(s.ball.x).not.toBe(origX);
  });

  it('moves player paddle based on dy', () => {
    const s = createState();
    s.running = true;
    s.player.dy = 1;
    const origY = s.player.y;
    update(s);
    expect(s.player.y).toBeGreaterThan(origY);
  });

  it('scores for AI when ball passes left edge', () => {
    const s = createState();
    s.running = true;
    s.ball.x = 1;
    s.ball.vx = -10;
    update(s);
    expect(s.score.ai).toBe(1);
  });

  it('scores for player when ball passes right edge', () => {
    const s = createState();
    s.running = true;
    s.ball.x = CANVAS_W - 1;
    s.ball.vx = 10;
    update(s);
    expect(s.score.player).toBe(1);
  });

  it('bounces ball off top/bottom walls', () => {
    const s = createState();
    s.running = true;
    s.ball.y = 2;
    s.ball.vy = -10;
    update(s);
    expect(s.ball.vy).toBeGreaterThan(0);
  });

  it('declares winner at winning score', () => {
    const s = createState();
    s.running = true;
    s.score.player = 4;
    s.ball.x = CANVAS_W - 1;
    s.ball.vx = 10;
    update(s);
    expect(s.winner).toBe('player');
    expect(s.running).toBe(false);
  });
});
