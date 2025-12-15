export function startGameLoop(game, updateUI) {
  let lastTime = performance.now();

  function loop(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    game.currencies.update(delta);
    updateUI(game);

    requestAnimationFrame(loop);
  }

  return loop;
}
