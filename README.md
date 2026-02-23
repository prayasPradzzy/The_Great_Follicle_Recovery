# The Great Follicle Recovery

A deterministic, trigonometry-driven 2D arcade game built with Phaser 3.
Plant hairs onto a rotating bald head with precision timing.

## Game Concept

Inspired by the core loop of Knife Hit, but redesigned with pure angle math:

- Target: rotating bald head
- Projectile: a single hair
- Goal: plant the required number of hairs
- Lose condition: a new hair overlaps an existing one
- Win condition: required count reached

No physics engine is used. All gameplay is deterministic and math-driven.

## Core Mechanics

### Rotating Target

- Central face rotates continuously
- Rotation uses delta time for frame-rate-independent behavior
- Speed and direction can change by level rules
- Rotation stops on win/lose

### Hair Throw + Attachment

- Player taps/clicks to throw
- Hair travels from bottom-center toward scalp via tween
- Impact is resolved on tween completion
- Hair sticks using polar-coordinate orbit math

```js
offsetAngle = impactAngle - face.rotation

totalAngle = face.rotation + offsetAngle
x = centerX + radius * Math.cos(totalAngle)
y = centerY + radius * Math.sin(totalAngle)
```

This guarantees stable circular attachment with no drift/jitter.

### Collision Detection (Angle-Based)

Hair overlap is resolved using wrapped angular distance:

```js
Math.abs(Phaser.Math.Angle.Wrap(newAngle - existingAngle)) < threshold
```

This keeps collision logic lightweight and precise.

## Tech Stack

| Layer | Technology |
|---|---|
| Engine | Phaser 3 |
| Language | ES6 JavaScript |
| Rendering | WebGL / Canvas (Phaser) |
| Physics | None (manual math only) |
| Audio | Phaser Sound Manager / Web Audio |
| Assets | PNG + OGG |

## Project Structure

```text
.
├── index.html
├── style.css
├── package.json
├── README.md
├── audio/
├── imgs/
└── src/
	├── config.js
	├── main.js
	├── managers/
	│   └── GameManager.js
	├── objects/
	│   ├── Face.js
	│   └── Hair.js
	└── scenes/
		└── GameScene.js
```

## Run Locally

### Prerequisites

- Node.js 18+

### Setup

```bash
npm install
```

### Start a local static server

Use either option:

```bash
npx serve .
```

or

```bash
npx live-server
```

Then open the local URL shown in the terminal.

## Current Gameplay Features

- Multi-level progression with level-specific speed/target/threshold
- Direction flips and occasional speed spikes (higher levels)
- Combo tracking
- Near-miss feedback
- Hit juice (flash, shake, punch scale, impact click)
- Win/lose overlays with restart flow

## Design Principles

- Deterministic gameplay over physics simulation
- Modular ES6 architecture
- No global gameplay state leakage
- Clear separation between scene, objects, and game rules

## Known Scope

This is a focused arcade prototype. It is intentionally simple, with one primary game mode and no backend.

## Repository

Made with love for Mannu.

Project link: https://github.com/prayasPradzzy/The_Great_Follicle_Recovery