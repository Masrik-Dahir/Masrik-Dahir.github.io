# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]
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
