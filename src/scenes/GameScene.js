import { CONFIG } from '../config.js';
import Face from '../objects/Face.js';
import Hair from '../objects/Hair.js';
import GameManager from '../managers/GameManager.js';

/**
 * Single scene — preload, create, update, UI, state transitions.
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    /* ─────────────── PRELOAD ─────────────── */

    preload() {
        this.load.image('face', 'imgs/bald head.png');
        this.load.image('hair', 'imgs/hair.png');
        this.load.audio('win', 'audio/win audio.ogg');
        this.load.audio('lose', 'audio/lose audio.ogg');
    }

    /* ─────────────── CREATE ─────────────── */

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.gm = new GameManager();
        this.cameras.main.setBackgroundColor('#f5f0e8');

        // Face — centred dynamically
        this.face = new Face(this, W / 2, H * 0.40);

        this.stuckHairs = [];
        this.launching = false;

        this.winSfx = this.sound.add('win');
        this.loseSfx = this.sound.add('lose');

        this._createUI(W);
        this.input.on('pointerdown', this._onTap, this);
    }

    /* ─────────────── UPDATE ─────────────── */

    update(_time, delta) {
        if (!this.gm.isPlaying) return;

        this.face.update(delta);

        for (const hair of this.stuckHairs) {
            hair.updateOrbit(this.face.x, this.face.y, this.face.rotation);
        }
    }

    /* ─────────────── INPUT ─────────────── */

    _onTap() {
        if (!this.gm.isPlaying || this.launching) return;
        this.launching = true;

        const W = this.scale.width;
        const H = this.scale.height;
        const radius = this.face.radius;

        const hair = new Hair(this, W / 2, H - CONFIG.HAIR.SPAWN_OFFSET_Y);

        // Tween target = bottom edge of stick circle
        const targetY = this.face.y + radius;

        hair.launch(targetY, (h) => this._onImpact(h));
    }

    /* ─────────────── IMPACT ─────────────── */

    /**
     * Called when the tween finishes — face.rotation is sampled NOW, not at tap time.
     * This is the critical fix: the head has been rotating during the tween.
     */
    _onImpact(hair) {
        // World-space impact angle: hair always arrives at bottom = π/2
        const IMPACT_ANGLE = Math.PI / 2;

        // Capture face rotation at THIS instant
        const faceRot = this.face.rotation;
        const radius = this.face.radius;

        // Relative offset — this is what keeps the hair glued to the face
        const offsetAngle = IMPACT_ANGLE - faceRot;

        // Collision check against existing planted offsets
        if (this.gm.checkCollision(offsetAngle)) {
            this._handleLose(hair);
            return;
        }

        // Plant the hair
        hair.stick(IMPACT_ANGLE, faceRot, radius);
        this.stuckHairs.push(hair);

        const result = this.gm.plant(offsetAngle);
        this._refreshUI();

        if (result === 'win') {
            this._handleWin();
        }

        this.launching = false;
    }

    /* ─────────────── WIN / LOSE ─────────────── */

    _handleWin() {
        this.gm.state = 'win';
        this.face.stop();
        this.launching = true;
        this.winSfx.play();
        this._showOverlay('YOU WIN!', CONFIG.UI.WIN_COLOR);
    }

    _handleLose(failedHair) {
        this.gm.lose();
        this.face.stop();
        this.launching = true;
        this.loseSfx.play();

        this.tweens.add({
            targets: failedHair.sprite,
            y: this.scale.height + 50,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => failedHair.destroy(),
        });

        this._showOverlay('GAME OVER', CONFIG.UI.LOSE_COLOR);
    }

    /* ─────────────── UI ─────────────── */

    _createUI(W) {
        this.scoreText = this.add
            .text(W / 2, CONFIG.PADDING, '', {
                fontFamily: 'Arial, sans-serif',
                fontSize: '22px',
                color: CONFIG.UI.TEXT_COLOR,
            })
            .setOrigin(0.5, 0)
            .setDepth(10);

        this._refreshUI();
    }

    _refreshUI() {
        this.scoreText.setText(
            `Hairs: ${this.gm.planted} / ${this.gm.winTarget}`
        );
    }

    _showOverlay(message, color) {
        const W = this.scale.width;
        const H = this.scale.height;

        this.add
            .rectangle(W / 2, H / 2, W, H, CONFIG.UI.BG_OVERLAY, CONFIG.UI.OVERLAY_ALPHA)
            .setDepth(20);

        this.add
            .text(W / 2, H / 2 - 40, message, {
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontSize: '48px',
                color: color,
                stroke: '#000000',
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(21);

        const btn = this.add
            .text(W / 2, H / 2 + 40, '[ TAP TO RESTART ]', {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setDepth(21)
            .setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => this._restart());

        this.time.delayedCall(500, () => {
            this.input.once('pointerdown', () => this._restart());
        });
    }

    /* ─────────────── RESTART ─────────────── */

    _restart() {
        for (const h of this.stuckHairs) h.destroy();
        this.stuckHairs = [];
        this.face.destroy();
        this.winSfx.stop();
        this.loseSfx.stop();
        this.scene.restart();
    }
}
