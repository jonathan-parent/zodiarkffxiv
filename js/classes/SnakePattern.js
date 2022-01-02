import constants from '../constants.js';
import utils from '../utils.js';

import Pattern from './Pattern.js';

class SnakePattern extends Pattern
{
    constructor(scene, rotation, side, pattern, animationDelay) {
        super(scene, rotation, animationDelay);
        this.side = side;
        this.pattern = pattern;
        this.snakePositions = [
            [
                [{ x: 250, y: 240 }, { x: 450, y: 240 }],
                [{ x: 350, y: 240 }, { x: 550, y: 240 }]
            ],
            [
                [{ x: 560, y: 250 }, { x: 560, y: 450 }],
                [{ x: 560, y: 350 }, { x: 560, y: 550 }]
            ],
            [
                [{ x: 250, y: 560 }, { x: 450, y: 560 }],
                [{ x: 350, y: 560 }, { x: 550, y: 560 }]
            ],
            [
                [{ x: 240, y: 250 }, { x: 240, y: 450 }],
                [{ x: 240, y: 350 }, { x: 240, y: 550 }]
            ]
        ];
        this.dangerSpots = this.scene.add.group();
        this.images = this.scene.add.group();
    }

    preDraw() {
        // Draw snake images
        let chosenSnakes = this.snakePositions[this.side][this.pattern];
        for (let snake of chosenSnakes) {
            // Add images to the middle and offset them by their position + half-size (to allow rotating around the middle later)
            let img = this.scene.add.image(400, 400, 'snake');
            img.setDisplayOrigin(400 - snake.x + img.width / 2, 400 - snake.y + img.height / 2);
            img.depth = constants.IMAGES_DEPTH;
            img.colorCounter = 0;
            this.images.add(img);
        }

        // Take rotation into account
        let dangerSpot1, dangerSpot2;
        if (this.pattern === 0 && this.rotation !== 'counterclockwise' || this.pattern === 1 && this.rotation === 'counterclockwise') {
            // Create transparent danger spots on snake lanes
            dangerSpot1 = this.scene.add.rectangle(400, 250, 400, 100, 0xDE151F);
            dangerSpot2 = this.scene.add.rectangle(400, 450, 400, 100, 0xDE151F);
        } else {
            dangerSpot1 = this.scene.add.rectangle(400, 350, 400, 100, 0xDE151F);
            dangerSpot2 = this.scene.add.rectangle(400, 550, 400, 100, 0xDE151F);
        }

        dangerSpot1.setVisible(false);
        dangerSpot2.setVisible(false);
        dangerSpot1.depth = constants.OTHER_POSTDRAW_DEPTH;
        dangerSpot2.depth = constants.OTHER_POSTDRAW_DEPTH;
        this.dangerSpots.add(dangerSpot1);
        this.dangerSpots.add(dangerSpot2);
    }

    postDraw() {
        const red = Phaser.Display.Color.ValueToColor(0xFF0000);
        const white = Phaser.Display.Color.ValueToColor(0xFFFFFF);
        const coolRed = Phaser.Display.Color.ValueToColor(0xDE151F);

        let timeline = this.scene.tweens.createTimeline();
        let delay = this.animationDelay;

        // Add rotation animation
        if (this.rotation) {
            timeline.add({
                targets: this.images.getChildren(),
                ease: 'Linear',
                duration: constants.ANIMATION_DURATIONS.rotation,
                angle: this.rotation === 'clockwise' ? 90 : -90
            });
            delay -= constants.ANIMATION_DURATIONS.rotation;
        }

        timeline.add({
            targets: this.images.getChildren(),
            duration: constants.ANIMATION_DURATIONS.snake / 2,
            colorCounter: 100,
            ease: 'Linear',
            delay: delay,
            yoyo: true,
            onUpdate: (tween, target) => {
                const targetColor = Phaser.Display.Color.Interpolate.ColorWithColor(white, red, 100, tween.getValue());
                target.setTint(Phaser.Display.Color.GetColor(targetColor.r, targetColor.g, targetColor.b));

                const dangerColor = Phaser.Display.Color.Interpolate.ColorWithColor(coolRed, red, 100, tween.getValue());
                for (const dangerSpot of this.dangerSpots.getChildren()) {
                    dangerSpot.fillColor = Phaser.Display.Color.GetColor(dangerColor.r, dangerColor.g, dangerColor.b);
                }
            },
            onYoyo: () => {
                for (const dangerSpot of this.dangerSpots.getChildren()) {
                    dangerSpot.setVisible(true);
                }
            }
        });
        timeline.play();
    }

    checkClick(pos) {
        for (const dangerSpot of this.dangerSpots.getChildren()) {
            if (utils.RectangleContainsPoint(dangerSpot, pos)) {
                return false;
            }
        }

        return true;
    }

    reset() {
        this.dangerSpots.clear(true, true);
        this.images.clear(true, true);
    }
}

export default SnakePattern;