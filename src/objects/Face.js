import { CONFIG } from '../config.js';

const TWO_PI = Math.PI * 2;
const J = CONFIG.JUICE;

function wrapAngle(angle) {
    angle = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
    if (angle > Math.PI) angle -= TWO_PI;
    return angle;
}

export default class Face {
    constructor(scene, speed, direction) {
        this.scene = scene;

        const size = CONFIG.FACE.DISPLAY_SIZE;
        this.sprite = scene.add.image(
            CONFIG.FACE.CENTER_X,
            CONFIG.FACE.CENTER_Y,
            'face'
        )
            .setDepth(0);

        const intrinsicMin = Math.min(this.sprite.width, this.sprite.height);
        const scale = size / intrinsicMin;
        this.sprite.setScale(scale);

        this.angularSpeed = speed * direction;
        this.active = true;

        /* hit-stop state */
        this._hitStopRemaining = 0;

        /* rotation impulse state */
        this._impulse = 0;
        this._impulseDecay = 0;

        /* scale punch baseline */
        this._baseScale = this.sprite.scaleX;

        this.debugGfx = null;
        if (CONFIG.DEBUG_RADIUS) {
            this.debugGfx = scene.add.graphics().setDepth(50);
            this._drawDebug();
        }
    }

    get radius() {
        return Math.min(this.sprite.displayWidth, this.sprite.displayHeight) / 2;
    }

    get attachRadius() {
        return this.radius - CONFIG.FACE.ATTACH_INSET;
    }

    get rotation() {
        return this.sprite.rotation;
    }

    get x() {
        return this.sprite.x;
    }

    get y() {
        return this.sprite.y;
    }

    /** Call from GameScene on every successful plant */
    triggerHitStop() {
        this._hitStopRemaining = J.HIT_STOP_MS;
    }

    /** Additive rotation kick that decays over IMPULSE_DECAY_MS */
    triggerImpulse(direction) {
        this._impulse = J.ROTATION_IMPULSE * direction;
        this._impulseDecay = J.IMPULSE_DECAY_MS;
    }

    /** Scale punch: pop up then ease back to baseline */
    triggerScalePunch() {
        const s = this.sprite;
        const target = this._baseScale * J.SCALE_PUNCH;
        this.scene.tweens.add({
            targets: s,
            scaleX: target,
            scaleY: target,
            duration: J.SCALE_PUNCH_DURATION * 0.3,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                s.scaleX = this._baseScale;
                s.scaleY = this._baseScale;
            },
        });
    }

    /** Win celebration: quick spin + scale pop */
    triggerWinCelebration() {
        const s = this.sprite;
        this.scene.tweens.add({
            targets: s,
            rotation: s.rotation + J.WIN_SPIN_SPEED,
            duration: J.WIN_SPIN_DURATION,
            ease: 'Cubic.easeOut',
        });
        this.scene.tweens.add({
            targets: s,
            scaleX: this._baseScale * J.WIN_SCALE_UP,
            scaleY: this._baseScale * J.WIN_SCALE_UP,
            duration: J.WIN_SCALE_DURATION,
            yoyo: true,
            ease: 'Sine.easeInOut',
        });
    }

    /** Fail: flash red tint */
    triggerFailFlash() {
        const s = this.sprite;
        s.setTint(J.FAIL_TINT);
        this.scene.time.delayedCall(J.FAIL_TINT_DURATION, () => s.clearTint());
    }

    update(delta) {
        if (!this.active) return;

        /* hit-stop: freeze rotation for a few ms */
        if (this._hitStopRemaining > 0) {
            this._hitStopRemaining -= delta;
            return;
        }

        /* impulse decay */
        let impulseAdd = 0;
        if (this._impulseDecay > 0) {
            const t = Math.max(0, this._impulseDecay - delta);
            const frac = t / J.IMPULSE_DECAY_MS;
            impulseAdd = this._impulse * frac;
            this._impulseDecay = t;
        }

        this.sprite.rotation = wrapAngle(
            this.sprite.rotation + (this.angularSpeed + impulseAdd) * (delta / 1000)
        );
        if (this.debugGfx) this._drawDebug();
    }

    /** Live-update angular speed (for GameManager speed/direction changes) */
    setAngularSpeed(speed, direction) {
        this.angularSpeed = speed * direction;
    }

    stop() {
        this.active = false;
    }

    _drawDebug() {
        this.debugGfx.clear();
        this.debugGfx.lineStyle(2, 0xff0000, 0.6);
        this.debugGfx.strokeCircle(this.x, this.y, this.radius);
        this.debugGfx.lineStyle(1, 0x00ff00, 0.4);
        this.debugGfx.strokeCircle(this.x, this.y, this.attachRadius);
    }
}
