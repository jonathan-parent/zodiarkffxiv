import constants from '../constants.js';

import Pattern from './Pattern.js';

class RotationPattern extends Pattern
{
    constructor(scene, rotation, animationDelay) {
        super(scene, rotation, animationDelay);
        this.arrows = this.scene.add.group();
    }

    preDraw() {
        let arrow1, arrow2, arrow3, arrow4;
        if (this.rotation === 'clockwise') {
            arrow1 = this.scene.add.image(200, 185, 'arrow');
            arrow2 = this.scene.add.image(610, 190, 'arrow');
            arrow2.angle = 65;
            arrow3 = this.scene.add.image(600, 615, 'arrow');
            arrow3.angle = 180;
            arrow4 = this.scene.add.image(190, 610, 'arrow');
            arrow4.angle = 245;
            
        } else {
            arrow1 = this.scene.add.image(190, 190, 'arrow');
            arrow1.angle = 295;
            arrow1.flipX = true;
            arrow2 = this.scene.add.image(600, 185, 'arrow');
            arrow2.flipX = true;
            arrow3 = this.scene.add.image(610, 610, 'arrow');
            arrow3.angle = 115;
            arrow3.flipX = true;
            arrow4 = this.scene.add.image(200, 615, 'arrow');
            arrow4.angle = 180;
            arrow4.flipX = true;
        }

        // Set depth on all arrows
        arrow1.depth = constants.IMAGES_DEPTH;
        arrow2.depth = constants.IMAGES_DEPTH;
        arrow3.depth = constants.IMAGES_DEPTH;
        arrow4.depth = constants.IMAGES_DEPTH;

        // Add arrows to group
        this.arrows.add(arrow1);
        this.arrows.add(arrow2);
        this.arrows.add(arrow3);
        this.arrows.add(arrow4);
    }

    postDraw() {
        // Hide arrows
        for (const arrow of this.arrows.getChildren()) {
            arrow.setVisible(false);
        }
    }

    reset() {
        this.arrows.clear(true, true);
    }
}

export default RotationPattern;