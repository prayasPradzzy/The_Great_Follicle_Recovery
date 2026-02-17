import { CONFIG } from '../config.js';

/**
 * The rotating bald-head target.
 * Owns rotation state; exposes dynamic stick radius derived from displayed size.
 */
export default class Face {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.add.image(x, y, 'face').setScale(CONFIG.FACE.SCALE);
        this.sprite.setDepth(0);

        this.angularSpeed = CONFIG.FACE.BASE_SPEED;
        this.active = true;

        // Optional debug: draw the stick-radius circle
        this.debugGfx = null;
        if (CONFIG.DEBUG_RADIUS) {
            this.debugGfx = scene.add.graphics();
            this.debugGfx.setDepth(50);
            this._drawDebug();
        }
    }

    /** Effective stick radius — computed from actual displayed sprite, minus inset */
    get radius() {
        return (this.sprite.displayWidth / 2) - CONFIG.FACE.STICK_INSET;
    }

    update(delta) {
        if (!this.active) return;
        this.sprite.rotation += this.angularSpeed * (delta / 1000);

        if (this.debugGfx) this._drawDebug();
    }

    _drawDebug() {
        this.debugGfx.clear();
        this.debugGfx.lineStyle(2, 0xff0000, 0.6);
        this.debugGfx.strokeCircle(this.sprite.x, this.sprite.y, this.radius);
    }

    levelUp(level) {
        this.angularSpeed =
            CONFIG.FACE.BASE_SPEED + CONFIG.FACE.SPEED_INCREMENT * (level - 1);
    }

    reverseDirection() {
        this.angularSpeed *= -1;
    }

    stop() {
        this.active = false;
    }

    get rotation() { return this.sprite.rotation; }
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    destroy() {
        this.sprite.destroy();
        if (this.debugGfx) this.debugGfx.destroy();
    }
}
