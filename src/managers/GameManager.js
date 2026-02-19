import { CONFIG } from '../config.js';

const TWO_PI = Math.PI * 2;
const DEG_TO_RAD = Math.PI / 180;
const LEVELS = CONFIG.LEVELS;

function wrapAngle(angle) {
    angle = ((angle % TWO_PI) + TWO_PI) % TWO_PI;
    if (angle > Math.PI) angle -= TWO_PI;
    return angle;
}

function clampLevel(lvl) {
    return Math.max(1, Math.min(lvl, LEVELS.length));
}

export default class GameManager {
    constructor(level = CONFIG.START_LEVEL) {
        this.reset(level);
    }

    /* ---- level row helper (0-indexed) ---- */
    get _row() {
        return LEVELS[clampLevel(this.level) - 1];
    }

    reset(level = CONFIG.START_LEVEL) {
        this.level = clampLevel(level);
        this.plantedAngles = [];
        this.state = 'playing';

        /* combo tracking */
        this.combo = 0;
        this.lastPlantTime = 0;

        /* direction flip timer */
        this._flipTimer = 0;
        this._dirMul = this.level % 2 === 0 ? -1 : 1;

        /* speed spike */
        this._spikeTimer = 0;
    }

    /* ---- read-only getters ---- */

    get planted()   { return this.plantedAngles.length; }
    get isPlaying() { return this.state === 'playing'; }
    get winTarget() { return this._row.target; }
    get remaining() { return Math.max(0, this.winTarget - this.planted); }

    get baseSpeed()  { return this._row.speed; }
    get direction()  { return this._dirMul; }
    get threshold()  { return this._row.threshold * DEG_TO_RAD; }

    /** effective speed includes spike multiplier */
    get speed() {
        const spike = this._spikeTimer > 0 ? CONFIG.JUICE.SPEED_SPIKE_MULT : 1;
        return this.baseSpeed * spike;
    }

    /* ---- per-frame tick (call from scene update, pass delta ms) ---- */
    tick(deltaMs) {
        /* speed spike countdown */
        if (this._spikeTimer > 0) this._spikeTimer -= deltaMs;

        /* direction flip */
        const flip = this._row.flipInterval;
        if (flip > 0) {
            this._flipTimer += deltaMs * 0.001;
            if (this._flipTimer >= flip) {
                this._flipTimer -= flip;
                this._dirMul *= -1;
            }
        }
    }

    /* ---- collision ---- */
    checkCollision(newOffset) {
        for (const existing of this.plantedAngles) {
            const diff = wrapAngle(newOffset - existing);
            if (Math.abs(diff) < this.threshold) return true;
        }
        return false;
    }

    /**
     * Returns the smallest absolute angular distance to any planted hair.
     * Used for near-miss detection. Returns Infinity if none planted.
     */
    nearestGap(newOffset) {
        let min = Infinity;
        for (const existing of this.plantedAngles) {
            const d = Math.abs(wrapAngle(newOffset - existing));
            if (d < min) min = d;
        }
        return min;
    }

    /* ---- plant ---- */
    plant(offsetAngle) {
        const now = performance.now();
        const wrapped = wrapAngle(offsetAngle);
        this.plantedAngles.push(wrapped);

        /* combo */
        if (this.lastPlantTime > 0 &&
            now - this.lastPlantTime < CONFIG.JUICE.COMBO_WINDOW_MS) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        this.lastPlantTime = now;

        /* maybe trigger speed spike */
        if (Math.random() < this._row.spikeChance) {
            this._spikeTimer = CONFIG.JUICE.SPEED_SPIKE_DURATION;
        }

        /* win check */
        if (this.planted >= this.winTarget) {
            this.state = 'win';
            return 'win';
        }
        return 'planted';
    }

    lose() {
        this.state = 'lose';
    }
}
