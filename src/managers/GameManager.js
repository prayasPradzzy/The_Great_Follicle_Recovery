import { CONFIG } from '../config.js';

/**
 * Pure-logic manager — no rendering, no Phaser objects.
 * Tracks planted angles, checks collisions, tracks win/lose state.
 */
export default class GameManager {
    constructor() {
        this.reset();
    }

    reset() {
        /** Offset angles of all successfully planted hairs */
        this.plantedAngles = [];
        this.level = CONFIG.START_LEVEL;
        this.winTarget = CONFIG.WIN_TARGET;
        this.state = 'playing'; // 'playing' | 'win' | 'lose'
    }

    get planted() {
        return this.plantedAngles.length;
    }

    /**
     * Check whether the incoming hair would collide with an existing one.
     * Uses angular proximity in offset-angle space.
     * @param {number} newOffset  the offset angle of the incoming hair
     * @returns {boolean} true if collision detected
     */
    checkCollision(newOffset) {
        const thresholdRad =
            Phaser.Math.DegToRad(CONFIG.COLLISION_THRESHOLD_DEG);

        for (const existing of this.plantedAngles) {
            const diff = Phaser.Math.Angle.Wrap(newOffset - existing);
            if (Math.abs(diff) < thresholdRad) {
                return true;
            }
        }
        return false;
    }

    /**
     * Register a successfully planted hair.
     * @param {number} offsetAngle
     * @returns {'win' | 'planted'}  result after planting
     */
    plant(offsetAngle) {
        this.plantedAngles.push(offsetAngle);

        if (this.planted >= this.winTarget) {
            this.state = 'win';
            return 'win';
        }
        return 'planted';
    }

    /** Mark game as lost */
    lose() {
        this.state = 'lose';
    }

    get isPlaying() {
        return this.state === 'playing';
    }
}
