The Great Follicle Recovery

A deterministic, trigonometry-driven 2D arcade game built with Phaser 3.
Plant hairs onto a rotating bald head with precision timing.

Overview

The Great Follicle Recovery is a timing-based arcade game inspired by Knife Hit, redesigned around pure mathematical attachment logic.

Instead of throwing knives at a log:

The target is a rotating bald head

The projectile is a single hair

The objective is to plant a required number of hairs

Overlapping an existing hair results in Game Over

Reaching the required count results in Victory

No physics engine is used.
All behavior is driven by deterministic angular mathematics.

Core Gameplay Mechanics
Rotating Target

A central head sprite rotates continuously

Rotation uses delta-based updates (frame rate independent)

Angular velocity is configurable

Rotation stops on win or lose

Hair Throw Mechanic

Player taps or clicks

A hair spawns at the bottom center

A linear tween sends it toward the scalp

Impact angle is calculated when the tween completes

The hair attaches using polar coordinate math

Polar Coordinate Attachment

Instead of collision bodies, the game uses deterministic circular math.

When a hair sticks:

offsetAngle = impactAngle - face.rotation

Each frame:

totalAngle = face.rotation + offsetAngle

x = centerX + radius * Math.cos(totalAngle)
y = centerY + radius * Math.sin(totalAngle)

This ensures:

Perfect circular attachment

Constant radius

No jitter

No floating

No physics drift

Collision Detection (Angle-Based)

Hair overlap is detected using angular comparison:

Math.abs(Phaser.Math.Angle.Wrap(newAngle - existingAngle)) < threshold

This avoids expensive 2D collision systems and keeps logic precise and performant.

Tech Stack
Layer	Technology
Engine	Phaser 3
Language	ES6 JavaScript
Rendering	WebGL / Canvas
Physics	None (manual math only)
Audio	Web Audio API via Phaser Sound Manager
Assets	PNG sprites
Project Structure
/src
 ├── main.js
 ├── scenes/
 │     └── GameScene.js
 ├── objects/
 │     ├── Face.js
 │     └── Hair.js
 ├── managers/
 │     └── GameManager.js

/assets
 ├── face.png
 ├── hair.png
 ├── win.mp3
 ├── lose.mp3
Architecture Principles

Modular ES6 class-based structure

No global variables

No Arcade Physics

No MatterJS

Clear separation of responsibilities

Deterministic math-driven gameplay

Installation & Running
Option 1 — Simple Static Server
npm install -g serve
serve .

Or:

npx live-server
Option 2 — Vite (Recommended for Development)
npm create vite@latest
npm install
npm run dev

Place Phaser and source files inside /src.

Design Decisions
Why No Physics Engine?

This mechanic does not require a physics simulation.

Using Box2D or Arcade Physics would:

Increase complexity

Reduce determinism

Introduce floating-point drift

The mechanic is purely angular.
A physics engine would be unnecessary overhead.

Why Polar Coordinates?

Circular motion is naturally expressed as:

x = cx + r * Math.cos(theta)
y = cy + r * Math.sin(theta)

This guarantees:

Perfect circular motion

Constant attachment radius

No drift

Clean mathematical model

Edge Cases Handled

Prevent multiple throws during active tween

Impact angle calculated at tween completion

Radius recalculated after scaling

Head rotation stops on win or lose

Audio playback controlled to prevent overlap

Win Condition

Player must plant a configurable number of hairs

On success: win audio and overlay

On failure: lose audio and restart option

Future Improvements

Level progression system

Dynamic rotation direction changes

Random obstacles on scalp

Combo scoring system

Particle effects and screen shake

Mobile touch optimizations

Progressive difficulty curve

Boss head levels

What This Project Demonstrates

Practical Phaser 3 architecture

Deterministic trigonometry-based gameplay

Clean modular ES6 structure

Collision handling without physics engines

Responsive canvas layout handling

Learning Outcome

This project serves as a foundation for:

Circular mechanics games

Knife Hit–style arcade systems

Orbit shooters

Radial defense games

Timing-based arcade mechanics

Mastering this circular attachment system opens the door to a wide category of 2D arcade designs.