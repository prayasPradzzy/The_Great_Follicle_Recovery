/**
 * Central game configuration — no magic numbers anywhere else.
 */
export const CONFIG = {
    /** Canvas dimensions (9:16 portrait) */
    WIDTH: 450,
    HEIGHT: 800,

    /** Safe-area padding for UI elements */
    PADDING: 24,

    /** Face / target settings */
    FACE: {
        SCALE: 1.3,
        BASE_SPEED: 1.2,           // radians per second at level 1
        SPEED_INCREMENT: 0.3,      // added per level
        STICK_INSET: 3,            // px inward from displayWidth/2 for tight attachment
    },

    /** Hair / projectile settings */
    HAIR: {
        SCALE: 0.08,
        SPAWN_OFFSET_Y: 100,       // pixels above canvas bottom
        TWEEN_DURATION: 200,       // ms to reach the scalp
    },

    /** Collision */
    COLLISION_THRESHOLD_DEG: 8,    // minimum angular gap between hairs (degrees)

    /** Win / level */
    WIN_TARGET: 12,
    START_LEVEL: 1,

    /** Set true to draw stick-radius circle for visual tuning */
    DEBUG_RADIUS: false,

    /** UI colours */
    UI: {
        TEXT_COLOR: '#333333',
        WIN_COLOR: '#2e8b57',
        LOSE_COLOR: '#cc3333',
        BG_OVERLAY: 0x000000,
        OVERLAY_ALPHA: 0.65,
    },
};
