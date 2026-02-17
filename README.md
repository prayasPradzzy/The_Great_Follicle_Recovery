🧑‍🦲 The Great Follicle Recovery

A 2D timing-based arcade game built with Phaser 3 where you plant hairs onto a rotating bald head.

Inspired by the core mechanics of “Knife Hit”, but redesigned as a deterministic trigonometry-driven gameplay experiment.

🎮 Game Concept

Instead of throwing knives at a log:

The target is a rotating bald head.

The projectile is a single hair.

The objective is to successfully plant a required number of hairs.

If a hair overlaps an existing hair → game over.

If you reach the required count → victory.

The mechanic is simple.
The execution is math-driven.
No physics engine involved.

🧠 Core Gameplay Mechanics
🔁 Rotating Target

A central head sprite rotates continuously.

Rotation speed can scale with difficulty.

Rotation uses delta-based updates (frame rate independent).

🧵 Hair Throw Mechanic

Player taps/clicks.

A hair spawns at bottom center.

A linear tween sends it toward the scalp.

On arrival → impact angle is calculated.

Hair attaches using polar coordinate math.

📐 Polar Coordinate Attachment

Instead of collision bodies, the game uses deterministic angle math.

When a hair sticks:

offsetAngle = impactAngle - face.rotation


Each frame:

totalAngle = face.rotation + offsetAngle

x = centerX + radius * cos(totalAngle)
y = centerY + radius * sin(totalAngle)


This ensures:

Perfect circular attachment

No floating

No physics drift

Deterministic behavior

❌ Collision Detection

Hair overlap is detected via angular comparison:

abs(Angle.Wrap(newAngle - existingAngle)) < threshold


This avoids expensive 2D collision systems and keeps logic precise.

🛠 Tech Stack

Engine: Phaser 3

Language: ES6 JavaScript

Rendering: WebGL / Canvas (handled by Phaser)

Physics: None (manual math only)

Assets: PNG sprites

Audio: Web Audio API via Phaser Sound Manager

🏗 Project Structure
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


Architecture Principles:

Modular class-based design

No global variables

No Arcade Physics

No MatterJS

Clean separation of responsibilities

📦 Installation & Running
Option 1 – Local Dev Server

Install a simple static server:

npm install -g serve
serve .


Or use:

npx live-server


Open in browser.

Option 2 – Vite (Recommended for dev)
npm create vite@latest
npm install
npm run dev


Place Phaser and source files inside /src.

🎯 Design Decisions
Why No Physics Engine?

Because this mechanic does not require it.

Using Box2D or Arcade Physics would:

Increase complexity

Reduce determinism

Introduce floating-point drift

The mechanic is purely angular.

Physics would be overkill.

Why Polar Coordinates?

Circular motion is naturally described using:

x = cx + r * cos(θ)
y = cy + r * sin(θ)


This guarantees:

Perfect attachment

Constant radius

No jitter

Clean mathematical model

🧪 Edge Cases Handled

Prevent multiple throws during tween

Impact angle calculated at tween completion (not at launch)

Radius recalculated after scaling

Head stops rotating on win/lose

Audio does not overlap

🏆 Win Condition

Player must plant a configurable number of hairs.

On success → win audio + overlay.

On failure → lose audio + restart option.

🚀 Future Improvements

Level progression system

Dynamic rotation direction changes

Random obstacles on scalp

Combo scoring system

Juice effects (particles, screen shake)

Mobile touch optimizations

Progressive difficulty curve

Boss head levels

📚 What This Project Demonstrates

Practical Phaser 3 game architecture

Deterministic trigonometry-based gameplay

Clean ES6 modular structure

Collision without physics engine

Responsive canvas layout handling

🧠 Learning Outcome

This project is a strong foundation for:

Circular mechanics games

Knife Hit clones

Orbit shooters

Radial defense games

Timing-based arcade systems

Mastering this mechanic unlocks a whole category of 2D arcade design.