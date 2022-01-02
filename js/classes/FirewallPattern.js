import constants from '../constants.js';
import utils from '../utils.js';

import Pattern from './Pattern.js';

class FirewallPattern extends Pattern
{
    constructor(scene, rotation, pattern, animationDelay) {
        super(scene, rotation, animationDelay);
        this.pattern = pattern;
        this.dangerSpots = this.scene.add.group();
        this.images = this.scene.add.group();
    }

    preDraw() {
        // Draw firewall image
        let firewall = this.scene.add.image(400, 400, 'firewall');
        firewall.depth = constants.FIREWALL_DEPTH;
        firewall.colorCounter = 0;
        this.images.add(firewall);

        if (this.pattern === 1) {
            firewall.angle = 90;
        }

        // Create transparent danger spots on firewall path
        let dangerSpot1, dangerSpot2;
        if ((this.pattern === 0 && this.rotation === 'clockwise') || (this.pattern === 1 && this.rotation === 'counterclockwise')) {
            // North and south parts will be danger spots
            dangerSpot1 = this.scene.add.triangle(400, 300, 0, 0, 400, 0, 200, 200, 0xDE151F);
            dangerSpot2 = this.scene.add.triangle(400, 500, 0, 200, 200, 0, 400, 200, 0xDE151F);
        } else {
            // East and west parts will be danger spots
            dangerSpot1 = this.scene.add.triangle(300, 400, 0, 0, 200, 200, 0, 400, 0xDE151F);
            dangerSpot2 = this.scene.add.triangle(500, 400, 0, 200, 200, 0, 200, 400, 0xDE151F);
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
        const currentAngle = this.images.getChildren()[0].angle;
        if (this.rotation) {
            timeline.add({
                targets: this.images.getChildren(),
                ease: 'Linear',
                duration: constants.ANIMATION_DURATIONS.rotation,
                angle: this.rotation === 'clockwise' ? (currentAngle + 90) : (currentAngle - 90)
            });
            delay -= constants.ANIMATION_DURATIONS.rotation;
        }

        timeline.add({
            targets: this.images.getChildren(),
            duration: constants.ANIMATION_DURATIONS.firewall / 2,
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
            if (utils.TriangleContainsPoint(dangerSpot, pos)) {
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

export default FirewallPattern;