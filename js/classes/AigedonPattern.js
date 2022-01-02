import constants from '../constants.js';
import utils from '../utils.js';

import Pattern from './Pattern.js';

class AigedonPattern extends Pattern
{
    constructor(scene, rotation, side, bossImage, animationDelay) {
        super(scene, rotation, animationDelay);
        this.side = side;
        this.bossImage = bossImage;
        this.dangerSpots = this.scene.add.group();
        this.images = this.scene.add.group();
        this.initialBossPosition = new Phaser.Geom.Point(bossImage.x, bossImage.y);
    }

    preDraw() {
        let points;
        // Move boss image, add cast bar and set polygon points based on side
        let castBar;
        if (this.side === 0) {
            this.bossImage.setPosition(140, 110);
            castBar = this.scene.add.image(140, 140, 'aigedon');
            // From NW to SE
            points = [
                new Phaser.Geom.Point(0, 0),
                new Phaser.Geom.Point(200, 0),
                new Phaser.Geom.Point(400, 200),
                new Phaser.Geom.Point(400, 400),
                new Phaser.Geom.Point(200, 400),
                new Phaser.Geom.Point(0, 200)
            ];
        } else if (this.side === 1) {
            this.bossImage.setPosition(660, 110);
            castBar = this.scene.add.image(660, 140, 'aigedon');
            // From NE to SW
            points = [
                new Phaser.Geom.Point(400, 0),
                new Phaser.Geom.Point(400, 200),
                new Phaser.Geom.Point(200, 400),
                new Phaser.Geom.Point(0, 400),
                new Phaser.Geom.Point(0, 200),
                new Phaser.Geom.Point(200, 0)
            ];
        }
        castBar.depth = constants.IMAGES_DEPTH;
        castBar.colorCounter = 0;
        this.images.add(castBar);

        // Create transparent danger spot on boss path
        let dangerSpot = this.scene.add.polygon(400, 400, points, 0xDE151F);
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
            duration: constants.ANIMATION_DURATIONS.adikia / 2,
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
            if (utils.PolygonContainsPoint(dangerSpot, pos)) {
                return false;
            }
        }

        return true;
    }

    reset() {
        this.bossImage.setPosition(this.initialBossPosition.x, this.initialBossPosition.y);
        this.dangerSpots.clear(true, true);
        this.images.clear(true, true);
    }
}

export default AigedonPattern;