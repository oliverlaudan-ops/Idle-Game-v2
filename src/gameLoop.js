export function startGameLoop(game, updateUI) {
  let lastTime = 0;

  function loop(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    game.currencies.update(delta);
    updateUI(game);
    lastTime = time;
    requestAnimationFrame(loop);
  }

  return loop;
}
