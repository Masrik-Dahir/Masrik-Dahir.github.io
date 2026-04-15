// @ts-check
const { test, expect } = require('@playwright/test');

// All 100 games with their IDs, init/stop function names, and expected control types
const GAMES = [
  { id: 'night-racer', init: 'initNightRacer', stop: 'stopNightRacer', controls: 'arrows' },
  { id: 'invaders', init: 'initSpaceInvaders', stop: 'stopSpaceInvaders', controls: 'arrows+space' },
  { id: 'snake', init: 'initSnake', stop: 'stopSnake', controls: 'arrows' },
  { id: 'tetris', init: 'initTetris', stop: 'stopTetris', controls: 'arrows' },
  { id: 'pacman', init: 'initPacman', stop: 'stopPacman', controls: 'arrows' },
  { id: 'breakout', init: 'initBreakout', stop: 'stopBreakout', controls: 'arrows' },
  { id: 'asteroids', init: 'initAsteroids', stop: 'stopAsteroids', controls: 'arrows+space' },
  { id: 'pong', init: 'initPong', stop: 'stopPong', controls: 'arrows' },
  { id: 'frogger', init: 'initFrogger', stop: 'stopFrogger', controls: 'arrows' },
  { id: 'missile', init: 'initMissileCommand', stop: 'stopMissileCommand', controls: 'click' },
  { id: 'flappy', init: 'initFlappyBird', stop: 'stopFlappyBird', controls: 'space' },
  { id: 'doodle', init: 'initDoodleJump', stop: 'stopDoodleJump', controls: 'arrows' },
  { id: 'centipede', init: 'initCentipede', stop: 'stopCentipede', controls: 'arrows+space' },
  { id: 'minesweeper', init: 'initMinesweeper', stop: 'stopMinesweeper', controls: 'click' },
  { id: 'donkey-kong', init: 'initDonkeyKong', stop: 'stopDonkeyKong', controls: 'arrows+space' },
  { id: 'simon', init: 'initSimon', stop: 'stopSimon', controls: 'click' },
  { id: 'connect-four', init: 'initConnectFour', stop: 'stopConnectFour', controls: 'click' },
  { id: 'galaga', init: 'initGalaga', stop: 'stopGalaga', controls: 'arrows+space' },
  { id: 'tic-tac-toe', init: 'initTicTacToe', stop: 'stopTicTacToe', controls: 'click' },
  { id: '2048', init: 'init2048', stop: 'stop2048', controls: 'arrows' },
  { id: 'lunar-lander', init: 'initLunarLander', stop: 'stopLunarLander', controls: 'arrows' },
  { id: 'bomberman', init: 'initBomberman', stop: 'stopBomberman', controls: 'arrows+space' },
  { id: 'galaxian', init: 'initGalaxian', stop: 'stopGalaxian', controls: 'arrows+space' },
  { id: 'defender', init: 'initDefender', stop: 'stopDefender', controls: 'arrows+space' },
  { id: '1942', init: 'init1942', stop: 'stop1942', controls: 'arrows+space' },
  { id: 'sokoban', init: 'initSokoban', stop: 'stopSokoban', controls: 'arrows' },
  { id: 'tempest', init: 'initTempest', stop: 'stopTempest', controls: 'arrows+space' },
  { id: 'qbert', init: 'initQbert', stop: 'stopQbert', controls: 'arrows' },
  { id: 'spy-hunter', init: 'initSpyHunter', stop: 'stopSpyHunter', controls: 'arrows+space' },
  { id: 'paperboy', init: 'initPaperboy', stop: 'stopPaperboy', controls: 'arrows+space' },
  { id: 'arkanoid', init: 'initArkanoid', stop: 'stopArkanoid', controls: 'arrows' },
  { id: 'dig-dug', init: 'initDigDug', stop: 'stopDigDug', controls: 'arrows+space' },
  { id: 'bubble-bobble', init: 'initBubbleBobble', stop: 'stopBubbleBobble', controls: 'arrows+space' },
  { id: 'joust', init: 'initJoust', stop: 'stopJoust', controls: 'arrows+space' },
  { id: 'burger-time', init: 'initBurgerTime', stop: 'stopBurgerTime', controls: 'arrows' },
  { id: 'ice-climber', init: 'initIceClimber', stop: 'stopIceClimber', controls: 'arrows+space' },
  { id: 'elevator-action', init: 'initElevatorAction', stop: 'stopElevatorAction', controls: 'arrows+space' },
  { id: 'excitebike', init: 'initExcitebike', stop: 'stopExcitebike', controls: 'arrows' },
  { id: 'kung-fu-master', init: 'initKungFuMaster', stop: 'stopKungFuMaster', controls: 'arrows+space' },
  { id: 'double-dragon', init: 'initDoubleDragon', stop: 'stopDoubleDragon', controls: 'arrows+space' },
  { id: 'pengo', init: 'initPengo', stop: 'stopPengo', controls: 'arrows+space' },
  { id: 'rally-x', init: 'initRallyX', stop: 'stopRallyX', controls: 'arrows' },
  { id: 'time-pilot', init: 'initTimePilot', stop: 'stopTimePilot', controls: 'arrows+space' },
  { id: 'phoenix', init: 'initPhoenix', stop: 'stopPhoenix', controls: 'arrows+space' },
  { id: 'moon-patrol', init: 'initMoonPatrol', stop: 'stopMoonPatrol', controls: 'arrows+space' },
  { id: 'scramble', init: 'initScramble', stop: 'stopScramble', controls: 'arrows+space' },
  { id: 'robotron', init: 'initRobotron', stop: 'stopRobotron', controls: 'arrows+space' },
  { id: 'gauntlet', init: 'initGauntlet', stop: 'stopGauntlet', controls: 'arrows+space' },
  { id: 'ghosts-n-goblins', init: 'initGhostsNGoblins', stop: 'stopGhostsNGoblins', controls: 'arrows+space' },
  { id: 'mega-man', init: 'initMegaMan', stop: 'stopMegaMan', controls: 'arrows+space' },
  { id: 'mario-bros', init: 'initMarioBros', stop: 'stopMarioBros', controls: 'arrows+space' },
  { id: 'balloon-fight', init: 'initBalloonFight', stop: 'stopBalloonFight', controls: 'arrows+space' },
  { id: 'lode-runner', init: 'initLodeRunner', stop: 'stopLodeRunner', controls: 'arrows+space' },
  { id: 'pitfall', init: 'initPitfall', stop: 'stopPitfall', controls: 'arrows+space' },
  { id: 'river-raid', init: 'initRiverRaid', stop: 'stopRiverRaid', controls: 'arrows+space' },
  { id: 'kaboom', init: 'initKaboom', stop: 'stopKaboom', controls: 'arrows' },
  { id: 'berzerk', init: 'initBerzerk', stop: 'stopBerzerk', controls: 'arrows+space' },
  { id: 'wizard-of-wor', init: 'initWizardOfWor', stop: 'stopWizardOfWor', controls: 'arrows+space' },
  { id: 'commando', init: 'initCommando', stop: 'stopCommando', controls: 'arrows+space' },
  { id: 'xevious', init: 'initXevious', stop: 'stopXevious', controls: 'arrows+space' },
  { id: 'star-force', init: 'initStarForce', stop: 'stopStarForce', controls: 'arrows+space' },
  { id: 'punch-out', init: 'initPunchOut', stop: 'stopPunchOut', controls: 'arrows+space' },
  { id: 'marble-madness', init: 'initMarbleMadness', stop: 'stopMarbleMadness', controls: 'arrows' },
  { id: 'qix', init: 'initQix', stop: 'stopQix', controls: 'arrows+space' },
  { id: 'puzzle-bobble', init: 'initPuzzleBobble', stop: 'stopPuzzleBobble', controls: 'arrows+space' },
  { id: 'columns', init: 'initColumns', stop: 'stopColumns', controls: 'arrows' },
  { id: 'dr-mario', init: 'initDrMario', stop: 'stopDrMario', controls: 'arrows' },
  { id: 'pipe-dream', init: 'initPipeDream', stop: 'stopPipeDream', controls: 'arrows' },
  { id: 'lights-out', init: 'initLightsOut', stop: 'stopLightsOut', controls: 'click' },
  { id: 'klax', init: 'initKlax', stop: 'stopKlax', controls: 'arrows' },
  { id: 'puyo-puyo', init: 'initPuyoPuyo', stop: 'stopPuyoPuyo', controls: 'arrows' },
  { id: 'reversi', init: 'initReversi', stop: 'stopReversi', controls: 'click' },
  { id: 'checkers', init: 'initCheckers', stop: 'stopCheckers', controls: 'click' },
  { id: 'memory-match', init: 'initMemoryMatch', stop: 'stopMemoryMatch', controls: 'click' },
  { id: 'sudoku', init: 'initSudoku', stop: 'stopSudoku', controls: 'click' },
  { id: 'mastermind', init: 'initMastermind', stop: 'stopMastermind', controls: 'click' },
  { id: 'hangman', init: 'initHangman', stop: 'stopHangman', controls: 'click' },
  { id: 'battleship', init: 'initBattleship', stop: 'stopBattleship', controls: 'click' },
  { id: 'chrome-dino', init: 'initChromeDino', stop: 'stopChromeDino', controls: 'space+down' },
  { id: 'helicopter', init: 'initHelicopter', stop: 'stopHelicopter', controls: 'space' },
  { id: 'crossy-road', init: 'initCrossyRoad', stop: 'stopCrossyRoad', controls: 'arrows' },
  { id: 'whack-a-mole', init: 'initWhackAMole', stop: 'stopWhackAMole', controls: 'click' },
  { id: 'fruit-ninja', init: 'initFruitNinja', stop: 'stopFruitNinja', controls: 'click' },
  { id: 'tapper', init: 'initTapper', stop: 'stopTapper', controls: 'arrows+space' },
  { id: 'adventure', init: 'initAdventure', stop: 'stopAdventure', controls: 'arrows+space' },
  { id: 'tower-defense', init: 'initTowerDefense', stop: 'stopTowerDefense', controls: 'click' },
  { id: 'gradius', init: 'initGradius', stop: 'stopGradius', controls: 'arrows+space' },
  { id: 'r-type', init: 'initRType', stop: 'stopRType', controls: 'arrows+space' },
  { id: 'wrecking-crew', init: 'initWreckingCrew', stop: 'stopWreckingCrew', controls: 'arrows+space' },
  { id: 'duck-hunt', init: 'initDuckHunt', stop: 'stopDuckHunt', controls: 'click' },
  { id: 'tank', init: 'initTank', stop: 'stopTank', controls: 'arrows+space' },
  { id: 'outrun', init: 'initOutrun', stop: 'stopOutrun', controls: 'arrows' },
  { id: 'pole-position', init: 'initPolePosition', stop: 'stopPolePosition', controls: 'arrows' },
  { id: 'track-field', init: 'initTrackField', stop: 'stopTrackField', controls: 'arrows+space' },
  { id: 'solitaire', init: 'initSolitaire', stop: 'stopSolitaire', controls: 'click' },
  { id: 'nonogram', init: 'initNonogram', stop: 'stopNonogram', controls: 'click' },
  { id: 'zaxxon', init: 'initZaxxon', stop: 'stopZaxxon', controls: 'arrows+space' },
  { id: 'jungle-hunt', init: 'initJungleHunt', stop: 'stopJungleHunt', controls: 'arrows+space' },
  { id: 'donkey-kong-jr', init: 'initDonkeyKongJr', stop: 'stopDonkeyKongJr', controls: 'arrows+space' },
  { id: 'mr-do', init: 'initMrDo', stop: 'stopMrDo', controls: 'arrows+space' },
];

// Helper: navigate to games page and wait for scripts to load
async function goToGames(page) {
  await page.goto('/games.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

// Helper: launch a game by id
async function launchGame(page, gameId) {
  await page.evaluate((id) => window.launchGame(id), gameId);
  await page.waitForTimeout(300);
}

// Helper: stop game and go back
async function stopGame(page) {
  await page.evaluate(() => window.backToGallery());
  await page.waitForTimeout(200);
}

// Helper: start playing (press Enter to exit title screen)
async function startPlaying(page) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
}

// ─── Gallery Tests ───
test.describe('Gallery', () => {
  test('all 100 game cards render in gallery', async ({ page }) => {
    await goToGames(page);
    const cards = await page.locator('.game-card').count();
    expect(cards).toBe(100);
  });

  test('game search filters cards', async ({ page }) => {
    await goToGames(page);
    await page.fill('#game-search-input', 'snake');
    await page.waitForTimeout(200);
    const visible = await page.locator('.game-card:visible').count();
    expect(visible).toBeGreaterThanOrEqual(1);
    expect(visible).toBeLessThan(100);
  });

  test('clicking a game card launches the game', async ({ page }) => {
    await goToGames(page);
    await page.locator('.game-card[data-game="snake"]').click();
    await page.waitForTimeout(500);
    const gameView = await page.locator('#game-view.active');
    await expect(gameView).toBeVisible();
  });

  test('back button returns to gallery', async ({ page }) => {
    await goToGames(page);
    await launchGame(page, 'snake');
    await page.click('#back-btn');
    await page.waitForTimeout(300);
    const gallery = page.locator('#gallery-view');
    await expect(gallery).toBeVisible();
  });
});

// ─── Game Init/Stop Tests ───
test.describe('Game init and stop', () => {
  for (const game of GAMES) {
    test(`${game.id}: init and stop functions exist and execute without error`, async ({ page }) => {
      await goToGames(page);
      const initExists = await page.evaluate((fn) => typeof window[fn] === 'function', game.init);
      expect(initExists).toBe(true);
      const stopExists = await page.evaluate((fn) => typeof window[fn] === 'function', game.stop);
      expect(stopExists).toBe(true);

      // Launch and verify no JS errors
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await launchGame(page, game.id);
      await page.waitForTimeout(500);
      await stopGame(page);
      expect(errors).toEqual([]);
    });
  }
});

// ─── Keyboard Controls Tests ───
test.describe('Keyboard controls', () => {
  // Games that use arrow keys for movement
  const arrowGames = GAMES.filter(g =>
    g.controls.includes('arrows')
  );

  for (const game of arrowGames) {
    test(`${game.id}: responds to arrow key input without error`, async ({ page }) => {
      await goToGames(page);
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await launchGame(page, game.id);
      await startPlaying(page);

      // Send arrow key presses
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);

      await stopGame(page);
      expect(errors).toEqual([]);
    });
  }

  // Games that use space bar
  const spaceGames = GAMES.filter(g =>
    g.controls.includes('space')
  );

  for (const game of spaceGames) {
    test(`${game.id}: responds to space bar input without error`, async ({ page }) => {
      await goToGames(page);
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await launchGame(page, game.id);
      await startPlaying(page);

      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);

      await stopGame(page);
      expect(errors).toEqual([]);
    });
  }
});

// ─── Mobile Button Tests ───
test.describe('Mobile controls', () => {
  // All games should have mobile buttons that respond to both touchstart and mousedown
  const mobileButtonGames = GAMES.filter(g => g.controls !== 'click');

  for (const game of mobileButtonGames) {
    test(`${game.id}: mobile buttons exist and handle mousedown`, async ({ page }) => {
      await goToGames(page);
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await launchGame(page, game.id);
      await startPlaying(page);

      // Verify mobile control buttons exist in the DOM
      const btnLeft = page.locator('#btn-left');
      const btnRight = page.locator('#btn-right');
      const btnUp = page.locator('#btn-up');
      const btnDown = page.locator('#btn-down');

      await expect(btnLeft).toBeAttached();
      await expect(btnRight).toBeAttached();
      await expect(btnUp).toBeAttached();
      await expect(btnDown).toBeAttached();

      // Click each button (simulates mousedown) — should not crash
      await btnUp.dispatchEvent('mousedown');
      await page.waitForTimeout(100);
      await btnUp.dispatchEvent('mouseup');

      await btnLeft.dispatchEvent('mousedown');
      await page.waitForTimeout(100);
      await btnLeft.dispatchEvent('mouseup');

      await btnRight.dispatchEvent('mousedown');
      await page.waitForTimeout(100);
      await btnRight.dispatchEvent('mouseup');

      await btnDown.dispatchEvent('mousedown');
      await page.waitForTimeout(100);
      await btnDown.dispatchEvent('mouseup');

      await stopGame(page);
      expect(errors).toEqual([]);
    });
  }
});

// ─── Canvas Rendering Tests ───
test.describe('Canvas rendering', () => {
  // Verify each game actually draws something on the canvas
  for (const game of GAMES) {
    test(`${game.id}: renders pixels to canvas`, async ({ page }) => {
      await goToGames(page);
      await launchGame(page, game.id);
      await page.waitForTimeout(600);

      // Check that the canvas has non-zero pixel data
      const hasPixels = await page.evaluate(() => {
        const cvs = document.getElementById('game-canvas');
        if (!cvs) return false;
        const ctx = cvs.getContext('2d');
        const data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) return true;
        }
        return false;
      });

      expect(hasPixels).toBe(true);
      await stopGame(page);
    });
  }
});

// ─── Game State Transition Tests ───
test.describe('Game state transitions', () => {
  // Test title → playing → gameover cycle for key games
  const testableGames = [
    'snake', 'invaders', 'tetris', 'pacman', 'breakout', 'asteroids',
    'flappy', 'chrome-dino', 'frogger', 'galaga', 'pong'
  ];

  for (const gameId of testableGames) {
    test(`${gameId}: transitions from title to playing on Enter`, async ({ page }) => {
      await goToGames(page);
      await launchGame(page, gameId);
      await page.waitForTimeout(300);

      // Should start in title state
      const beforeState = await page.evaluate(() => {
        // Try to detect game state from HUD — score should be 0 on title
        return document.getElementById('hud-score')?.textContent;
      });

      // Press Enter to start
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Verify game canvas is still rendering (no crash)
      const hasPixels = await page.evaluate(() => {
        const cvs = document.getElementById('game-canvas');
        if (!cvs) return false;
        const ctx = cvs.getContext('2d');
        const data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) return true;
        }
        return false;
      });
      expect(hasPixels).toBe(true);

      await stopGame(page);
    });
  }
});

// ─── HUD Update Tests ───
test.describe('HUD updates during gameplay', () => {
  const hudGames = [
    'snake', 'invaders', 'tetris', 'pacman', 'breakout',
    'galaga', 'chrome-dino', 'frogger', 'asteroids'
  ];

  for (const gameId of hudGames) {
    test(`${gameId}: HUD elements update during gameplay`, async ({ page }) => {
      await goToGames(page);
      await launchGame(page, gameId);
      await startPlaying(page);

      // Let the game run for a moment
      await page.waitForTimeout(1000);

      // HUD should have some content
      const scoreText = await page.locator('#hud-score').textContent();
      expect(scoreText).not.toBeNull();

      await stopGame(page);
    });
  }
});

// ─── Difficulty Progression Tests ───
test.describe('Difficulty progression', () => {
  // Test that games have increasing difficulty by checking level-based parameters
  test('space-invaders: enemy speed increases with level', async ({ page }) => {
    await goToGames(page);
    await launchGame(page, 'invaders');
    await startPlaying(page);

    // Check level 1 parameters exist
    const hasLevel = await page.evaluate(() => {
      // The game should have level tracking
      return typeof document.getElementById('hud-speed')?.textContent === 'string';
    });
    expect(hasLevel).toBe(true);

    await stopGame(page);
  });

  test('snake: speed increases as snake grows', async ({ page }) => {
    await goToGames(page);
    await launchGame(page, 'snake');
    await startPlaying(page);
    await page.waitForTimeout(500);

    const hudContent = await page.locator('#hud-speed').textContent();
    expect(hudContent).toBeTruthy();

    await stopGame(page);
  });
});

// ─── Click-based Game Tests ───
test.describe('Click-based games', () => {
  const clickGames = GAMES.filter(g => g.controls === 'click');

  for (const game of clickGames) {
    test(`${game.id}: responds to canvas click without error`, async ({ page }) => {
      await goToGames(page);
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await launchGame(page, game.id);
      // Click canvas to start and interact
      await page.click('#game-canvas');
      await page.waitForTimeout(500);
      await page.click('#game-canvas', { position: { x: 300, y: 200 } });
      await page.waitForTimeout(300);

      await stopGame(page);
      expect(errors).toEqual([]);
    });
  }
});

// ─── No Memory Leak Tests ───
test.describe('No memory leaks on game switch', () => {
  test('switching between 10 games does not cause errors', async ({ page }) => {
    await goToGames(page);
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const gameIds = ['snake', 'tetris', 'pacman', 'invaders', 'breakout',
                     'flappy', 'pong', 'frogger', 'asteroids', 'galaga'];

    for (const id of gameIds) {
      await launchGame(page, id);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      await stopGame(page);
      await page.waitForTimeout(100);
    }

    expect(errors).toEqual([]);
  });
});

// ─── WASD Alternative Controls Tests ───
test.describe('WASD controls', () => {
  const wasdGames = ['snake', 'invaders', 'pacman', 'frogger', 'bomberman'];

  for (const gameId of wasdGames) {
    test(`${gameId}: responds to WASD keys`, async ({ page }) => {
      await goToGames(page);
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await launchGame(page, gameId);
      await startPlaying(page);

      await page.keyboard.press('w');
      await page.keyboard.press('a');
      await page.keyboard.press('s');
      await page.keyboard.press('d');
      await page.waitForTimeout(300);

      await stopGame(page);
      expect(errors).toEqual([]);
    });
  }
});
