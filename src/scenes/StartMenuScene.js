import { CONFIG } from '../config.js';

export default class StartMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartMenuScene' });
        this.started = false;
    }

    create() {
        const W = CONFIG.WIDTH;
        const H = CONFIG.HEIGHT;

        this.cameras.main.setBackgroundColor(CONFIG.UI.BG_COLOR);

        const title = this.add
            .text(W / 2, H * 0.30, 'HELP MANNU MAFIA', {
                fontFamily: 'Trebuchet MS, Verdana, Arial, sans-serif',
                fontStyle: 'bold',
                fontSize: '38px',
                color: '#ff9e80',
                stroke: '#fffaf5',
                strokeThickness: 5,
                align: 'center',
            })
            .setOrigin(0.5)
            .setDepth(10);

        const subtitle = this.add
            .text(W / 2, H * 0.42, 'HELP MY BALD GUY TO GET SOME HAIR', {
                fontFamily: 'Verdana, Trebuchet MS, Arial, sans-serif',
                fontStyle: 'bold',
                fontSize: '17px',
                color: '#72bfae',
                stroke: '#fffdf8',
                strokeThickness: 3,
                align: 'center',
                wordWrap: { width: W * 0.82 },
            })
            .setOrigin(0.5)
            .setDepth(10);

        this.tweens.add({
            targets: title,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.tweens.add({
            targets: subtitle,
            scaleX: 1.06,
            scaleY: 1.06,
            duration: 760,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const buttonY = H * 0.64;
        const buttonWidth = 200;
        const buttonHeight = 64;

        const playButton = this.add
            .rectangle(W / 2, buttonY, buttonWidth, buttonHeight, 0xbdeee3, 1)
            .setStrokeStyle(4, 0xffd2bd)
            .setDepth(10)
            .setInteractive({ useHandCursor: true });

        const playText = this.add
            .text(W / 2, buttonY, 'PLAY', {
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontSize: '28px',
                color: '#2f6a5c',
            })
            .setOrigin(0.5)
            .setDepth(11);

        const menuElements = [title, subtitle, playButton, playText];

        playButton.on('pointerover', () => {
            if (this.started) return;
            playButton.setFillStyle(0xcdf4eb, 1);
        });

        playButton.on('pointerout', () => {
            if (this.started) return;
            playButton.setFillStyle(0xbdeee3, 1);
        });

        playButton.on('pointerdown', () => {
            if (this.started) return;
            this.started = true;

            this._playClickSfx();
            playButton.disableInteractive();
            playButton.setFillStyle(0x9fd8ca, 1);
            playText.setText('STARTING...');

            this.tweens.add({
                targets: [playButton, playText],
                scaleX: 0.94,
                scaleY: 0.94,
                duration: 70,
                yoyo: true,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    this.tweens.killTweensOf([title, subtitle]);
                    this.tweens.add({
                        targets: menuElements,
                        alpha: 0,
                        duration: 180,
                        ease: 'Quad.easeOut',
                        onComplete: () => this.scene.start('GameScene'),
                    });
                },
            });
        });
    }

    _playClickSfx() {
        try {
            const ctx = this.sound.context;
            if (!ctx || !ctx.createOscillator) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(900, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.035);

            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (_e) {
        }
    }
}