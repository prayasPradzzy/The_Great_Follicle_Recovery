import { CONFIG } from './config.js';
import GameScene from './scenes/GameScene.js';

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: CONFIG.UI.BG_COLOR,
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
});
