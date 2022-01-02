import constants from '../constants.js';

import Pattern from './Pattern.js';

class AdikiaPattern extends Pattern
{
    constructor(scene, rotation, bossImage, animationDelay) {
        super(scene, rotation, animationDelay);
        this.bossImage = bossImage;
        this.dangerSpots = this.scene.add.group();
        this.images = this.scene.add.group();
    }

    preDraw() {
        // Draw cast bar
        let castBar = this.scene.add.image(400, 140, 'adikia');
        castBar.depth = constants.IMAGES_DEPTH;
        castBar.colorCounter = 0;
        this.images.add(castBar);

        // Create transparent danger spots
        let dangerSpot1 = this.scene.add.arc(200, 400, 200, 90, 270, true, 0xDE151F);
        let dangerSpot2 = this.scene.add.arc(600, 400, 200, 90, 270, false, 0xDE151F);
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

        this.scene.tweens.add({
            targets: this.images.getChildren(),
            duration: constants.ANIMATION_DURATIONS.aigedon / 2,
            colorCounter: 100,
            ease: 'Linear',
            delay: this.animationDelay,
            yoyo: true,
            onUpdate: (tween, target) => {
                const targetColor = Phaser.Display.Color.Interpolate.ColorWithColor(white, red, 100, tween.getValue());
                target.setTint(Phaser.Display.Color.GetColor(targetColor.r, targetColor.g, targetColor.b));
                this.bossImage.setTint(Phaser.Display.Color.GetColor(targetColor.r, targetColor.g, targetColor.b));

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
            if (Phaser.Geom.Ellipse.ContainsPoint(dangerSpot, pos)) {
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

export default AdikiaPattern;