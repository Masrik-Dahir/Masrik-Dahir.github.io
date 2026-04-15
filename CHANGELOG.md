# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]
### Added
- 12 fully playable retro games: Space Invaders, Snake, Tetris, Pong, Breakout, Asteroids, Pac-Man, Frogger, Missile Command, Flappy Bird, Doodle Jump, Galaga
- Galaga game with full arcade mechanics: 5-row x 8-column enemy formation, sine-wave dive attacks, boss capture/dual-fighter mechanic, bonus stages every 3 levels, geometric enemy sprites (butterfly regulars, red commanders with antennae, blue/purple boss with pulsing glow), scrolling parallax star field, bullet trails, expanding particle explosions
- Each game in its own JS file under `js/games/` with IIFE architecture, init/stop lifecycle, keyboard + mobile + Tab input, title/gameover screens, particles, and HUD integration
- Dynamic game launcher routing via GAME_MAP in games.html
- Per-game themed title bar background animations (12 unique themes: racer, space, matrix, blocks, dots, bricks, rocks, volley, river, defend, sky, bounce)
- Game physics & winnability test suite in `tests/test_games.html`
- Game development rules added to CLAUDE.md (testing, easy mode, winnability)

### Changed
- All 12 game cards now show "PLAY" tag (no more "COMING SOON")
- All games tuned for easy mode: more lives (5), slower enemies, gentler speed ramps, wider hitboxes
- Pac-Man ghost AI fixed: ghosts now properly escape ghost house and chase player
- Flappy Bird made much easier: wider pipe gaps (210px), slower gravity, gentle speed ramp
- Doodle Jump made easier: lighter gravity, wider platforms, slower camera, delayed special platforms
- Frogger fully rewritten: fixed crash on title screen, forgiving log collision, home row snaps to nearest lily pad, slower lanes, longer logs, animated lily pads with glow
- Frogger visuals overhauled: real car shapes with wheels/windshield/roof/taillights, rounded log shapes with bark texture and end rings, animated water waves, "RIDE THE LOGS!" in-game hint for first 8 seconds, labeled safe zones, frog counter "X/5 HOME", mini frog life icons
- Frogger title screen redesigned: numbered 3-step instructions (1. dodge cars, 2. ride logs — water=death, 3. land on lily pads) with mini icon illustrations for each step
- Flappy Bird score display fixed: responsive position that scales with canvas size, clamped font, semi-transparent background pill for readability (no longer clips on small screens)
- Frogger coordinate bug fixed: cars/logs now render at same offset as frog (was causing phantom deaths where frog appeared clear of car but collision said otherwise)
- Missile Command made much easier: fewer missiles per wave (3+2×level, was 6+3×level), slower missile speed (25, was 40), gentler scaling (+4/level, was +8), bigger explosion radius (85px, was 65), longer explosion life (2s, was 1.5s), more ammo (60 start, 70 cap), one destroyed city restored every 3 waves
- Asteroids made harder: 4+3×level asteroids (was 2+2×level), large rocks split into 3 pieces, faster debris, planet-colored asteroids with crater details, 7 color varieties
- Games page redesigned with white theme matching site design (white backgrounds, Georgia font, red accents)
- Gallery header replaced with search bar matching software page pattern
- Night Racer now supports Tab key to start/restart game
- Night Racer game-over screen text spacing improved to prevent overlap on smaller screens
- Cursor now stays visible on game canvas across all displays
- Game instructions updated with accurate control descriptions (Enter, Tab, or Tap to start; Arrow keys / WASD to steer & accelerate)

### Added
- New "Games" tab in site navigation linking to `/games`
- Playable pseudo-3D retro car racing game ("Night Racer") in `games.html` with canvas rendering, traffic obstacles, scenery, score/time HUD, and mobile touch controls
- Animated SVG author banner (compass-rose-unfold) and project banner (globe-orbit-trace) in `.github/banners/`
- Banner manifest tracking system at `.github/banners/manifest.json`
- Hero screenshot SVG mockup at `.github/screenshots/hero.svg`
- GitHub Actions workflows: `banner-archive.yml`, `stats.yml`, `release-stats.yml`, `update-badges.yml`
- Dependabot configuration for GitHub Actions updates
- Repository Statistics section in README with stats branch instructions
- 32 canvas-based retro game animations on the home page with shuffle button
- New games: Geometry Dash, Bejeweled, Defender, Helicopter (replacing Racing, Connect Four, DVD Bounce, Rain)

### Changed
- Full README rewrite with animated banners, Mermaid architecture diagrams, TL;DR, hero screenshot, badge row, and CI/CD documentation
- Removed `.claude/` and `CLAUDE.md` from git tracking and added them to `.gitignore`
- Improved Doodle Jump with monsters, springs, moving/breaking platforms and better character graphics
- Enhanced Pinball with 20+ bumpers, slingshots, rail guides, and ball trail effects
- Tanks now has 8 tanks, 12 wall obstacles, craters, and HP bars
- Tower Defense redesigned with serpentine zigzag path, 15+ leveled towers, and denser enemy spawning
- Maze Runner now has 3 simultaneous BFS-solving runners with colored trails
- Fireworks upgraded with 5 burst types, 10 colors, faster launch rate, and rocket trails
- Whack-a-Mole slowed down (longer pop timing, moles stay up longer, slower mallet)
- Platformer AI improved to ~90% success rate with edge detection and look-ahead
- Round 3: Doodle Jump adds jetpacks, auto-shooting projectiles, vanishing platforms, parallax clouds
- Round 3: Geometry Dash adds sawblades, tall pillars, parallax mountains, gradual speed ramp
- Round 3: Bejeweled fixed white screen bug (grid was too large); now uses fixed 8-col grid with distinct gem shapes
- Round 3: Whack-a-Mole adds golden moles (3x pts), hard-hat moles, combo multiplier, floating score popups, grass field BG
- Round 3: Platformer near-100% success with coyote time, wider platforms, narrower gaps, recovery steering, lower gravity
- Round 3: Helicopter adds floating obstacles (stalactites/rocks), collectible stars, parallax cave, cabin window, speed ramp
