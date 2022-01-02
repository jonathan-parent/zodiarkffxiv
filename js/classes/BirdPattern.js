import constants from '../constants.js';

import Pattern from './Pattern.js';

class BirdPattern extends Pattern
{
    constructor(scene, rotation, animalTypes, animationDelay) {
        super(scene, rotation, animationDelay);
        this.animalTypes = animalTypes;
        this.animalPositions = [
            { x: 300, y: 300 },
            { x: 500, y: 300 },
            { x: 500, y: 500 },
            { x: 300, y: 500 }
        ];
        this.safeSpots = this.scene.add.group();
        this.images = this.scene.add.group();
    }

    preDraw() {
        for (let i = 0; i < 4; i++) {
            // Add images to the middle and offset them by their position + half-size (to allow rotating around the middle later)
            let img = this.scene.add.image(400, 400, this.animalTypes[i]);
            img.setDisplayOrigin(400 - this.animalPositions[i].x + img.width / 2, 400 - this.animalPositions[i].y + img.height / 2);
            img.depth = constants.IMAGES_DEPTH;
            img.colorCounter = 0;
            this.images.add(img);
        }

        /*this.scene.tweens.add({
            targets: this.images.getChildren(),
            ease: 'Linear',
            duration: 1000,
            angle: -90
        });*/

        // Copy array by value
        let animals = this.animalTypes.slice();

        // Apply rotation to array if applicable
        if (this.rotation) {
            if (this.rotation === 'clockwise') {
                // Shift elements right by 1
                animals.unshift.apply(animals, animals.splice(3, 1));
            } else if (this.rotation === 'counterclockwise') {
                // Shift elements left by 1
                animals.push.apply(animals, animals.splice(0, 1));
            }
        }

        // Cover whole arena in red except for birds
        this.dangerSpot = this.scene.add.rectangle(constants.ARENA_SIZE, constants.ARENA_SIZE, constants.GAME_SIZE / 2, constants.GAME_SIZE / 2, 0xFF0000);
        this.dangerSpot.depth = constants.ARENA_POSTDRAW_DEPTH;
        this.dangerSpot.setVisible(false);

        // Create transparent safe spots on birds
        for (let i = 0; i < 4; i++) {
            if (animals[i] === 'bird') {
                let safeSpot = this.scene.add.ellipse(this.animalPositions[i].x, this.animalPositions[i].y, 80, 80, 0x27B24A);
                safeSpot.setVisible(false);
                safeSpot.depth = constants.BIRDS_POSTDRAW_DEPTH;
                this.safeSpots.add(safeSpot);
            }
        }
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
            duration: constants.ANIMATION_DURATIONS.bird / 2,
            colorCounter: 100,
            ease: 'Linear',
            delay: delay,
            yoyo: true,
            onUpdate: (tween, target) => {
                const targetColor = Phaser.Display.Color.Interpolate.ColorWithColor(white, red, 100, tween.getValue());
                target.setTint(Phaser.Display.Color.GetColor(targetColor.r, targetColor.g, targetColor.b));

                const dangerColor = Phaser.Display.Color.Interpolate.ColorWithColor(coolRed, red, 100, tween.getValue());
                this.dangerSpot.fillColor = Phaser.Display.Color.GetColor(dangerColor.r, dangerColor.g, dangerColor.b);
            },
            onYoyo: () => {
                for (const safeSpot of this.safeSpots.getChildren()) {
                    safeSpot.setVisible(true);
                }
                this.dangerSpot.setVisible(true);
            }
        });
        timeline.play();
    }

    checkClick(pos) {
        for (const safeSpot of this.safeSpots.getChildren()) {
            if (Phaser.Geom.Ellipse.ContainsPoint(safeSpot, pos)) {
                return true;
            }
        }

        return false;
    }

    reset() {
        this.dangerSpot.destroy();
        this.safeSpots.clear(true, true);
        this.images.clear(true, true);
    }
}

export default BirdPattern;