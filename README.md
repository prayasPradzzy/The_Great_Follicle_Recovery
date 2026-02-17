# The Great Follicle Recovery

A fun, casual browser game built with **Phaser 3** where you tap to launch hairs onto a spinning bald head. Plant all the hairs without colliding to win!

## Gameplay

- A bald head rotates in the center of the screen.
- Tap anywhere to launch a hair strand upward toward the head.
- The hair sticks where it lands — but if it collides with an already-planted hair, it's **Game Over**.
- Successfully plant **12 hairs** to win the level.

## Tech Stack

- **Phaser 3.60** — game engine (loaded via CDN)
- **Vanilla JavaScript** (ES modules)
- **HTML5 / CSS3** — responsive 9:16 portrait layout with mobile support

## Project Structure

```
index.html              Entry point
style.css               Responsive layout & phone-frame styling
src/
  config.js             Central game configuration (speeds, sizes, thresholds)
  main.js               Phaser bootstrap
  managers/
    GameManager.js       Game-state logic (collision detection, win/lose)
  objects/
    Face.js              Rotating bald-head target
    Hair.js              Hair projectile & orbit mechanics
  scenes/
    GameScene.js         Main scene — preload, create, update, input, UI
audio/
  win audio.ogg          Victory sound effect
  lose audio.ogg         Defeat sound effect
imgs/
  bald head.png          Bald head sprite
  hair.png               Hair strand sprite
```

## Getting Started

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd mannu
   ```

2. **Serve locally** — the project uses ES modules, so it needs an HTTP server:
   ```bash
   # using Python
   python -m http.server 8000

   # or using Node
   npx serve .
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000` and start tapping!

## Configuration

All tunable parameters live in [`src/config.js`](src/config.js):

| Parameter | Default | Description |
|---|---|---|
| `FACE.BASE_SPEED` | 1.2 rad/s | Head rotation speed at level 1 |
| `FACE.SPEED_INCREMENT` | 0.3 rad/s | Speed added per level |
| `COLLISION_THRESHOLD_DEG` | 8° | Minimum angular gap between hairs |
| `WIN_TARGET` | 12 | Hairs needed to win |
| `HAIR.TWEEN_DURATION` | 200 ms | Time for hair to reach the head |
| `DEBUG_RADIUS` | false | Draw collision radius circle |

## Controls

- **Tap / Click** — launch a hair

## License

This project is for personal/educational use.
