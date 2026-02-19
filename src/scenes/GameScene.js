import { CONFIG } from '../config.js';
import Face from '../objects/Face.js';
import Hair from '../objects/Hair.js';
import GameManager from '../managers/GameManager.js';

const J = CONFIG.JUICE;
const DEG_TO_RAD = Math.PI / 180;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('face', 'imgs/bald head.png');
        this.load.image('hair', 'imgs/hair.png');
        this.load.audio('win', 'audio/win audio.ogg');
        this.load.audio('lose', 'audio/lose audio.ogg');
    }

    create(data = {}) {
        const W = CONFIG.WIDTH;
        const H = CONFIG.HEIGHT;
        const level = data.level || CONFIG.START_LEVEL;

        this.gm = new GameManager(level);
        this.cameras.main.setBackgroundColor(CONFIG.UI.BG_COLOR);

        this.face = new Face(this, this.gm.speed, this.gm.direction);
        this.stuckHairs = [];
        this.activeHair = null;
        this.launching = false;
        this.inputLocked = false;

        this.winSfx = this.sound.add('win');
        this.loseSfx = this.sound.add('lose');

        /* impact-flash overlay (drawn once, stays hidden) */
        this.flashRect = this.add
            .rectangle(W / 2, H / 2, W, H, 0xffffff, 0)
            .setDepth(30);

        this._createUI(W, H);
        this.input.on('pointerdown', this._onTap, this);
    }

    update(_time, delta) {
        if (!this.gm.isPlaying) return;

        /* let GameManager tick (speed spikes, direction flips) */
        this.gm.tick(delta);

        /* keep face in sync with GameManager's live speed/direction */
        this.face.setAngularSpeed(this.gm.speed, this.gm.direction);
        this.face.update(delta);

        const cx = this.face.x;
        const cy = this.face.y;
        const rot = this.face.rotation;
        for (const hair of this.stuckHairs) {
            hair.updateOrbit(cx, cy, rot);
        }
    }

    /* ── Input ── */

    _onTap() {
        if (!this.gm.isPlaying || this.launching || this.inputLocked) return;
        this.launching = true;

        const spawnX = CONFIG.FACE.CENTER_X;
        const spawnY = CONFIG.HEIGHT - CONFIG.HAIR.SPAWN_OFFSET_Y;
        const hair = new Hair(this, spawnX, spawnY);
        this.activeHair = hair;

        const targetY = this._getImpactPoint(this.face.radius, CONFIG.HAIR.THROW_ANGLE).y;
        hair.launch(targetY, (h) => this._onImpact(h));
    }

    /* ── Impact ── */

    _onImpact(hair) {
        if (!this.gm.isPlaying) {
            this.launching = false;
            this.activeHair = null;
            hair.destroy();
            return;
        }

        const impact = this._getImpactData();
        hair.sprite.setPosition(impact.point.x, impact.point.y);

        const faceRot = this.face.rotation;
        const offsetAngle = Phaser.Math.Angle.Wrap(impact.angle - faceRot);

        if (this.gm.checkCollision(offsetAngle)) {
            this._handleLose(hair);
            return;
        }

        /* ---- near-miss check (before planting) ---- */
        const gap = this.gm.nearestGap(offsetAngle);
        const nearMissDeg = gap / DEG_TO_RAD;
        const isNearMiss = isFinite(gap)
            && nearMissDeg > this.gm.threshold / DEG_TO_RAD
            && nearMissDeg < J.NEAR_MISS_DEG;

        /* plant */
        hair.stick(offsetAngle, this.face.attachRadius);
        this.stuckHairs.push(hair);
        this.activeHair = null;

        const result = this.gm.plant(offsetAngle);

        /* ---- JUICE: hit feedback ---- */
        this.face.triggerHitStop();
        this.face.triggerImpulse(this.gm.direction);
        this.face.triggerScalePunch();
        hair.triggerPunchScale();
        hair.triggerGlow();
        this._flashScreen();
        this._shakeCamera(J.SHAKE_INTENSITY, J.SHAKE_DURATION);
        this._playImpactSfx();

        /* combo text */
        if (this.gm.combo >= 2) {
            this._showComboText(this.gm.combo);
        }

        /* near-miss feedback */
        if (isNearMiss) {
            hair.triggerNearMiss();
            this._showFloatingText('CLOSE!', hair.sprite.x, hair.sprite.y - 20, '#ff8800');
        }

        this._refreshUI();

        if (result === 'win') {
            this._handleWin();
            return;
        }

        this.launching = false;
    }

    _getImpactData() {
        const angle = CONFIG.HAIR.THROW_ANGLE;
        const point = this._getImpactPoint(this.face.radius, angle);
        return { angle, point };
    }

    _getImpactPoint(radius, angle) {
        return {
            x: this.face.x + radius * Math.cos(angle),
            y: this.face.y + radius * Math.sin(angle),
        };
    }

    /* ── Juice helpers ── */

    _flashScreen() {
        this.flashRect.setAlpha(J.FLASH_ALPHA);
        this.tweens.add({
            targets: this.flashRect,
            alpha: 0,
            duration: J.FLASH_DURATION,
            ease: 'Quad.easeOut',
        });
    }

    _shakeCamera(intensity, duration) {
        this.cameras.main.shake(duration, intensity);
    }

    _playImpactSfx() {
        /* use a short synthetic click via Web Audio if available */
        try {
            const ctx = this.sound.context;
            if (ctx && ctx.createOscillator) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = 600 + Math.random() * 200;
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
                osc.connect(gain).connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.06);
            }
        } catch (_e) {
            /* silent fail – audio isn't critical */
        }
    }

    _showComboText(combo) {
        const label = combo >= 5
            ? `🔥 ${combo}x COMBO!`
            : `${combo}x COMBO`;

        const txt = this.add
            .text(CONFIG.WIDTH / 2, CONFIG.FACE.CENTER_Y - CONFIG.FACE.DISPLAY_SIZE / 2 - 40, label, {
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontSize: `${CONFIG.UI.COMBO_FONT_SIZE}px`,
                color: combo >= 5 ? '#ff4400' : '#ff8800',
                stroke: '#000000',
                strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setDepth(25)
            .setAlpha(0);

        this.tweens.add({
            targets: txt,
            alpha: 1,
            y: txt.y - 20,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: txt,
                    alpha: 0,
                    y: txt.y - 15,
                    duration: 400,
                    delay: 300,
                    ease: 'Quad.easeIn',
                    onComplete: () => txt.destroy(),
                });
            },
        });
    }

    _showFloatingText(msg, x, y, color) {
        const txt = this.add
            .text(x, y, msg, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                color,
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5)
            .setDepth(25)
            .setAlpha(0);

        this.tweens.add({
            targets: txt,
            alpha: 1,
            y: y - 18,
            duration: 180,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: txt,
                    alpha: 0,
                    y: txt.y - 12,
                    duration: 350,
                    delay: 200,
                    ease: 'Quad.easeIn',
                    onComplete: () => txt.destroy(),
                });
            },
        });
    }

    /* ── Win / Lose ── */

    _handleWin() {
        this.face.stop();
        this.inputLocked = true;
        this.launching = false;
        this.activeHair = null;

        /* celebration juice */
        this.face.triggerWinCelebration();
        this._shakeCamera(J.SHAKE_INTENSITY * 1.5, 200);

        if (this.winSfx.isPlaying) this.winSfx.stop();
        this.winSfx.play({ seek: 0, rate: 1.05 });

        const nextLevel = this.gm.level + 1;
        const maxLevel = CONFIG.LEVELS.length;
        const isMaxed = nextLevel > maxLevel;

        this._showOverlay(
            isMaxed ? 'ALL CLEAR!' : 'YOU WIN!',
            CONFIG.UI.WIN_COLOR,
            isMaxed ? '[ TAP TO REPLAY ]' : `Level ${nextLevel} →`,
            () => this._restart(isMaxed ? CONFIG.START_LEVEL : nextLevel)
        );
    }

    _handleLose(failedHair) {
        this.gm.lose();
        this.face.stop();
        this.inputLocked = true;
        this.launching = false;
        this.activeHair = null;

        /* fail juice */
        this.face.triggerFailFlash();
        this._shakeCamera(J.FAIL_SHAKE_INTENSITY, J.FAIL_SHAKE_DURATION);

        if (this.loseSfx.isPlaying) this.loseSfx.stop();
        this.loseSfx.play({ seek: 0, rate: 0.92 });

        this.tweens.add({
            targets: failedHair.sprite,
            y: CONFIG.HEIGHT + CONFIG.TIMING.FAIL_DROP_DISTANCE,
            alpha: 0,
            duration: CONFIG.TIMING.FAIL_DROP_DURATION,
            ease: 'Power2',
            onComplete: () => failedHair.destroy(),
        });

        const cooldownMs = CONFIG.TIMING.LOSE_RESTART_COOLDOWN;
        const cooldownStep = CONFIG.TIMING.LOSE_COUNTDOWN_STEP;
        let remaining = Math.ceil(cooldownMs / cooldownStep);
        let restartReady = false;

        const { btnText } = this._showOverlay(
            'GAME OVER',
            CONFIG.UI.LOSE_COLOR,
            `[ RESTARTING IN ${remaining} ]`,
            () => this._restart(CONFIG.START_LEVEL),
            {
                interactive: true,
                activationDelayMs: cooldownMs,
            }
        );

        this.time.addEvent({
            delay: cooldownStep,
            loop: true,
            callback: () => {
                remaining -= 1;
                if (remaining > 0 && btnText && btnText.active) {
                    btnText.setText(`[ RESTARTING IN ${remaining} ]`);
                } else if (remaining <= 0 && btnText && btnText.active && !restartReady) {
                    restartReady = true;
                    btnText.setText('[ TAP TO RESTART ]');
                    this._startRestartGlow(btnText);
                }
            },
        });
    }

    /* ── UI ── */

    _createUI(W, _H) {
        this.scoreText = this.add
            .text(W / 2, CONFIG.PADDING, '', {
                fontFamily: 'Arial, sans-serif',
                fontSize: `${CONFIG.UI.SCORE_FONT_SIZE}px`,
                color: CONFIG.UI.TEXT_COLOR,
            })
            .setOrigin(0.5, 0)
            .setDepth(10);

        this._refreshUI();
    }

    _refreshUI() {
        const { planted, winTarget, level, remaining, combo } = this.gm;
        let txt = `Level ${level}  ·  ${planted} / ${winTarget}`;
        if (remaining <= 3 && remaining > 0) {
            txt += `  (${remaining} left)`;
        }
        this.scoreText.setText(txt);
    }

    _showOverlay(title, color, buttonLabel, onAction, options = {}) {
        const W = CONFIG.WIDTH;
        const H = CONFIG.HEIGHT;
        const interactive = options.interactive !== false;
        const activationDelayMs = options.activationDelayMs ?? CONFIG.TIMING.OVERLAY_DELAY;

        const overlay = this.add
            .rectangle(W / 2, H / 2, W, H, CONFIG.UI.BG_OVERLAY, 0)
            .setDepth(20);

        if (interactive) {
            overlay.setInteractive();
        }

        /* fade in the overlay */
        this.tweens.add({
            targets: overlay,
            fillAlpha: CONFIG.UI.OVERLAY_ALPHA,
            duration: 300,
            ease: 'Quad.easeOut',
        });

        const titleText = this.add
            .text(W / 2, H / 2 - CONFIG.UI.OVERLAY_TITLE_OFFSET_Y, title, {
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontSize: `${CONFIG.UI.TITLE_FONT_SIZE}px`,
                color: color,
                stroke: '#000000',
                strokeThickness: 4,
            })
            .setOrigin(0.5)
            .setDepth(21)
            .setAlpha(0)
            .setScale(0.7);

        this.tweens.add({
            targets: titleText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 350,
            delay: 100,
            ease: 'Back.easeOut',
        });

        const btnText = this.add
            .text(W / 2, H / 2 + CONFIG.UI.OVERLAY_BUTTON_OFFSET_Y, buttonLabel, {
                fontFamily: 'Arial, sans-serif',
                fontSize: `${CONFIG.UI.BUTTON_FONT_SIZE}px`,
                color: '#ffffff',
            })
            .setOrigin(0.5)
            .setDepth(21)
            .setAlpha(0);

        this.tweens.add({
            targets: btnText,
            alpha: 1,
            duration: 250,
            delay: 350,
            ease: 'Quad.easeOut',
        });

        if (interactive && typeof onAction === 'function') {
            this.time.delayedCall(activationDelayMs, () => {
                if (overlay.active) overlay.once('pointerdown', onAction);
            });
        }

        return { overlay, titleText, btnText };
    }

    _startRestartGlow(btnText) {
        btnText.setColor('#fff2b8');
        this.tweens.add({
            targets: btnText,
            alpha: 0.75,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 550,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    /* ── Restart ── */

    _restart(level) {
        this.inputLocked = true;
        this.launching = false;

        if (this.activeHair) {
            this.activeHair.destroy();
            this.activeHair = null;
        }

        for (const hair of this.stuckHairs) {
            hair.destroy();
        }
        this.stuckHairs.length = 0;

        this.gm.reset(level);
        this.sound.stopAll();
        this.scene.restart({ level });
    }
}
