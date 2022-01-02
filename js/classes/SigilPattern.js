import constants from '../constants.js';
import utils from '../utils.js';

import Pattern from './Pattern.js';

class SigilPattern extends Pattern
{
    constructor(scene, rotation, side, shape, animationDelay) {
        super(scene, rotation, animationDelay);
        this.side = side;
        this.shape = shape;
        this.dangerSpots = this.scene.add.group();
        this.images = this.scene.add.group();
    }

    preDraw() {
        // Draw sigil image
        let x, y;
        switch (this.side) {
            case 0:
                // North
                x = 400;
                y = 150;
                break;
            case 1:
                // East
                x = 650;
                y = 400;
                break;
            case 2:
                // South
                x = 400;
                y = 650;
                break;
            case 3:
                // West
                x = 150;
                y = 400;
                break;
        }
        let sigil = this.scene.add.image(x, y, this.shape);
        sigil.depth = constants.IMAGES_DEPTH;
        if (this.side === 1) {
            sigil.flipX = true;
        }
        sigil.colorCounter = 0;
        this.images.add(sigil);

        // Create transparent danger spot on sigil path
        let dangerSpot;
        if (this.shape === 'triangle') {
            // Only east and west supported for triangle
            switch (this.side) {
                case 1:
                    dangerSpot = this.scene.add.triangle(400, 400, 0, 0, 400, 200, 0, 400, 0xDE151F);
                    break;
                case 3:
                    dangerSpot = this.scene.add.triangle(400, 400, 0, 200, 400, 0, 400, 400, 0xDE151F);
                    break;
            }
        } else if (this.shape === 'square') {
            // All but north supported for square
            switch (this.side) {
                case 1:
                    dangerSpot = this.scene.add.rectangle(500, 400, 200, 400, 0xDE151F);
                    break;
                case 2:
                    dangerSpot = this.scene.add.rectangle(400, 500, 400, 200, 0xDE151F);
                    break;
                case 3:
                    dangerSpot = this.scene.add.rectangle(300, 400, 200, 400, 0xDE151F);
                    break;
            }
        }

        dangerSpot.setVisible(false);
        dangerSpot.depth = constants.OTHER_POSTDRAW_DEPTH;
        this.dangerSpots.add(dangerSpot);
    }

    postDraw() {
        const red = Phaser.Display.Color.ValueToColor(0xFF0000);
        const white = Phaser.Display.Color.ValueToColor(0xFFFFFF);
        const coolRed = Phaser.Display.Color.ValueToColor(0xDE151F);

        this.scene.tweens.add({
            targets: this.images.getChildren(),
            duration: constants.ANIMATION_DURATIONS.sigil / 2,
            colorCounter: 100,
            ease: 'Linear',
            delay: this.animationDelay,
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
    }

    checkClick(pos) {
        for (const dangerSpot of this.dangerSpots.getChildren()) {
            if ((this.shape === 'triangle' && utils.TriangleContainsPoint(dangerSpot, pos)) || (this.shape === 'square' && utils.RectangleContainsPoint(dangerSpot, pos))) {
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

export default SigilPattern;