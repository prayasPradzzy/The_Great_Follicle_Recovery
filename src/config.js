const WIDTH = 450;
const HEIGHT = 800;

const HEAD_DISPLAY = Math.round(WIDTH * 0.5);
const HEAD_RADIUS = HEAD_DISPLAY / 2;
const ATTACH_INSET = 2;

const HAIR_HEIGHT = Math.round(HEAD_DISPLAY * 0.22);
const HAIR_WIDTH = Math.max(14, Math.round(HEAD_DISPLAY * 0.06) + 2);

/**
 * 20-level progression table.
 * Each entry: { speed, target, threshold, flipInterval, spikeChance }
 *   speed         – rad/s base rotation
 *   target        – hairs to plant
 *   threshold     – collision arc in degrees
 *   flipInterval  – seconds between direction reversals (0 = no flip)
 *   spikeChance   – probability per plant of a 0.4s speed spike (0–1)
 */
const LEVELS = [
    { speed: 1.0,  target: 5,  threshold: 12, flipInterval: 0,   spikeChance: 0    },
    { speed: 1.1,  target: 6,  threshold: 11, flipInterval: 0,   spikeChance: 0    },
    { speed: 1.2,  target: 7,  threshold: 10, flipInterval: 0,   spikeChance: 0    },
    { speed: 1.4,  target: 8,  threshold: 10, flipInterval: 0,   spikeChance: 0    },
    { speed: 1.6,  target: 8,  threshold: 9,  flipInterval: 5,   spikeChance: 0    },
    { speed: 1.8,  target: 9,  threshold: 9,  flipInterval: 4.5, spikeChance: 0.05 },
    { speed: 2.0,  target: 9,  threshold: 8,  flipInterval: 4,   spikeChance: 0.08 },
    { speed: 2.1,  target: 10, threshold: 8,  flipInterval: 3.5, spikeChance: 0.10 },
    { speed: 2.3,  target: 10, threshold: 7,  flipInterval: 3,   spikeChance: 0.10 },
    { speed: 2.4,  target: 11, threshold: 7,  flipInterval: 2.5, spikeChance: 0.12 },
    { speed: 2.5,  target: 11, threshold: 7,  flipInterval: 2.5, spikeChance: 0.12 },
    { speed: 2.6,  target: 12, threshold: 6,  flipInterval: 2,   spikeChance: 0.15 },
    { speed: 2.7,  target: 12, threshold: 6,  flipInterval: 2,   spikeChance: 0.15 },
    { speed: 2.8,  target: 13, threshold: 6,  flipInterval: 1.8, spikeChance: 0.18 },
    { speed: 2.9,  target: 13, threshold: 5,  flipInterval: 1.8, spikeChance: 0.18 },
    { speed: 3.0,  target: 14, threshold: 5,  flipInterval: 1.5, spikeChance: 0.20 },
    { speed: 3.1,  target: 14, threshold: 5,  flipInterval: 1.5, spikeChance: 0.20 },
    { speed: 3.2,  target: 15, threshold: 5,  flipInterval: 1.2, spikeChance: 0.22 },
    { speed: 3.3,  target: 15, threshold: 5,  flipInterval: 1.0, spikeChance: 0.25 },
    { speed: 3.5,  target: 16, threshold: 5,  flipInterval: 1.0, spikeChance: 0.25 },
];

export const CONFIG = {
    WIDTH,
    HEIGHT,
    PADDING: 24,
    LEVELS,

    FACE: {
        DISPLAY_SIZE: HEAD_DISPLAY,
        CENTER_X: WIDTH / 2,
        CENTER_Y: HEIGHT / 2,
        ATTACH_INSET,
    },

    HAIR: {
        WIDTH: HAIR_WIDTH,
        HEIGHT: HAIR_HEIGHT,
        SPAWN_OFFSET_Y: 80,
        TWEEN_DURATION: 180,
        THROW_ANGLE: Math.PI / 2,
    },

    START_LEVEL: 1,
    DEBUG_RADIUS: false,

    JUICE: {
        HIT_STOP_MS: 80,
        SHAKE_INTENSITY: 0.003,
        SHAKE_DURATION: 120,
        SCALE_PUNCH: 1.12,
        SCALE_PUNCH_DURATION: 150,
        ROTATION_IMPULSE: 0.06,
        IMPULSE_DECAY_MS: 200,
        FLASH_ALPHA: 0.25,
        FLASH_DURATION: 80,
        HAIR_GLOW_ALPHA: 0.6,
        HAIR_GLOW_FADE: 300,
        COMBO_WINDOW_MS: 1200,
        NEAR_MISS_DEG: 14,
        NEAR_MISS_SCALE: 1.08,
        NEAR_MISS_DURATION: 200,
        SPEED_SPIKE_MULT: 1.6,
        SPEED_SPIKE_DURATION: 400,
        WIN_SPIN_SPEED: 8,
        WIN_SPIN_DURATION: 600,
        WIN_SCALE_UP: 1.2,
        WIN_SCALE_DURATION: 400,
        FAIL_SHAKE_INTENSITY: 0.008,
        FAIL_SHAKE_DURATION: 300,
        FAIL_TINT: 0xff4444,
        FAIL_TINT_DURATION: 200,
    },

    TIMING: {
        FAIL_DROP_DISTANCE: 50,
        FAIL_DROP_DURATION: 400,
        LOSE_RESTART_COOLDOWN: 3000,
        LOSE_COUNTDOWN_STEP: 1000,
        OVERLAY_DELAY: 500,
    },

    UI: {
        BG_COLOR: '#efe2cc',
        TEXT_COLOR: '#333333',
        WIN_COLOR: '#2e8b57',
        LOSE_COLOR: '#cc3333',
        BG_OVERLAY: 0x000000,
        OVERLAY_ALPHA: 0.65,
        TITLE_FONT_SIZE: 48,
        BUTTON_FONT_SIZE: 20,
        SCORE_FONT_SIZE: 22,
        COMBO_FONT_SIZE: 18,
        OVERLAY_TITLE_OFFSET_Y: 40,
        OVERLAY_BUTTON_OFFSET_Y: 40,
    },
};
