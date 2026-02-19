import { CONFIG } from '../config.js';

const TWO_PI = Math.PI * 2;
const J = CONFIG.JUICE;

function wrapAngle(angle) {
    angle = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
    if (angle > Math.PI) angle -= TWO_PI;
    return angle;
}

export default class Hair {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.add.image(x, y, 'hair')
            .setDisplaySize(CONFIG.HAIR.WIDTH, CONFIG.HAIR.HEIGHT)
            .setOrigin(0.5, 1)
            .setDepth(1);

        this.offsetAngle = 0;
        this.attachRadius = 0;
        this.stuck = false;
        this._baseScaleX = this.sprite.scaleX;
        this._baseScaleY = this.sprite.scaleY;
    }

    launch(targetY, onComplete) {
        this.scene.tweens.add({
            targets: this.sprite,
            y: targetY,
            duration: CONFIG.HAIR.TWEEN_DURATION,
            ease: 'Power2',
            onComplete: () => onComplete(this),
        });
    }

    stick(offsetAngle, attachRadius) {
        this.offsetAngle = wrapAngle(offsetAngle);
        this.attachRadius = attachRadius;
        this.stuck = true;
    }

    /** Impact scale punch: brief pop on stick */
    triggerPunchScale() {
        const s = this.sprite;
        const px = this._baseScaleX * J.SCALE_PUNCH;
        const py = this._baseScaleY * J.SCALE_PUNCH;
        this.scene.tweens.add({
            targets: s,
            scaleX: px,
            scaleY: py,
            duration: J.SCALE_PUNCH_DURATION * 0.35,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => {
                s.scaleX = this._baseScaleX;
                s.scaleY = this._baseScaleY;
            },
        });
    }

    /** Bright glow flash that fades out */
    triggerGlow() {
        const glow = this.scene.add.image(
            this.sprite.x, this.sprite.y, 'hair'
        )
            .setDisplaySize(CONFIG.HAIR.WIDTH * 2.5, CONFIG.HAIR.HEIGHT * 2.5)
            .setOrigin(0.5, 1)
            .setAlpha(J.HAIR_GLOW_ALPHA)
            .setTint(0xffffff)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(2)
            .setRotation(this.sprite.rotation);

        this.scene.tweens.add({
            targets: glow,
            alpha: 0,
            duration: J.HAIR_GLOW_FADE,
            ease: 'Quad.easeOut',
            onComplete: () => glow.destroy(),
        });
    }

    /** Near-miss wiggle: slight scale bump */
    triggerNearMiss() {
        const s = this.sprite;
        const px = this._baseScaleX * J.NEAR_MISS_SCALE;
        const py = this._baseScaleY * J.NEAR_MISS_SCALE;
        this.scene.tweens.add({
            targets: s,
            scaleX: px,
            scaleY: py,
            duration: J.NEAR_MISS_DURATION * 0.4,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => {
                s.scaleX = this._baseScaleX;
                s.scaleY = this._baseScaleY;
            },
        });
    }

    updateOrbit(centerX, centerY, centerRotation) {
        if (!this.stuck) return;

        const worldAngle = wrapAngle(centerRotation + this.offsetAngle);

        this.sprite.x = centerX + this.attachRadius * Math.cos(worldAngle);
        this.sprite.y = centerY + this.attachRadius * Math.sin(worldAngle);
        this.sprite.rotation = worldAngle + Math.PI / 2;
    }

    destroy() {
        this.sprite.destroy();
    }
}
