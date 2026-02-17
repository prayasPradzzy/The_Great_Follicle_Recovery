import { CONFIG } from '../config.js';

/**
 * A single hair projectile.
 * States: FLYING (tween upward) → STUCK (orbiting with the face).
 *
 * Origin is (0.5, 1) so the bottom tip is the anchor point.
 * Once stuck, position/rotation are recalculated every frame via polar math.
 */
export default class Hair {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.add.image(x, y, 'hair')
            .setScale(CONFIG.HAIR.SCALE)
            .setOrigin(0.5, 1);
        this.sprite.setDepth(1);

        this.offsetAngle = 0;
        this.radius = 0;
        this.stuck = false;
    }

    /**
     * Tween straight up toward the bottom edge of the scalp circle.
     * @param {number} targetY  faceY + radius  (bottom boundary)
     * @param {Function} onComplete  called when tween finishes
     */
    launch(targetY, onComplete) {
        this.scene.tweens.add({
            targets: this.sprite,
            y: targetY,
            duration: CONFIG.HAIR.TWEEN_DURATION,
            ease: 'Power2',
            onComplete: () => onComplete(this),
        });
    }

    /**
     * Attach this hair to the face at the moment of impact.
     *
     * impactAngle is the world-space angle where the hair hit the circle.
     * For a straight-up approach this is always π/2 (bottom of circle).
     * We store the RELATIVE offset so the hair rotates with the face.
     *
     * @param {number} impactAngle   world angle of impact point (radians)
     * @param {number} faceRotation  face.rotation captured at tween completion
     * @param {number} radius        effective stick radius
     */
    stick(impactAngle, faceRotation, radius) {
        this.offsetAngle = impactAngle - faceRotation;
        this.radius = radius;
        this.stuck = true;
    }

    /**
     * Recalculate position on the rotating circle.
     * Called every frame for stuck hairs.
     */
    updateOrbit(faceX, faceY, faceRotation) {
        if (!this.stuck) return;

        const totalAngle = faceRotation + this.offsetAngle;

        this.sprite.x = faceX + this.radius * Math.cos(totalAngle);
        this.sprite.y = faceY + this.radius * Math.sin(totalAngle);

        // Rotate sprite to point radially outward
        this.sprite.rotation = totalAngle + Math.PI / 2;
    }

    destroy() {
        this.sprite.destroy();
    }
}
