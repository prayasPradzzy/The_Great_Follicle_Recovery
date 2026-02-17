import { CONFIG } from './config.js';
import GameScene from './scenes/GameScene.js';

/**
 * Phaser 3 bootstrap — single entry point.
 */
const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#f5f0e8',
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: {
        disableWebAudio: false,
    },
});
