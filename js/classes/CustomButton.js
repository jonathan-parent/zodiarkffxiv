class CustomButton extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, text, callback, upImage, overImage, downImage, disabledImage) {
        super(scene, x, y);

        this.enabled = true;

        this.scene = scene;
        this.upImage = scene.add.image(0, 0, upImage);
        this.overImage = scene.add.image(0, 0, overImage);
        this.downImage = scene.add.image(0, 0, downImage);
        this.disabledImage = scene.add.image(0, 0, disabledImage);
        this.text = scene.add.text(0, 0, text).setOrigin(0.5).setTint(0x000000);

        this.add(this.upImage);
        this.add(this.overImage);
        this.add(this.downImage);
        this.add(this.disabledImage);
        this.add(this.text);

        this.overImage.setVisible(false);
        this.downImage.setVisible(false);
        this.disabledImage.setVisible(false);
        
        this.setSize(this.upImage.width, this.upImage.height);

        this.setInteractive({ cursor: 'pointer' })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                if (this.enabled) {
                    this.upImage.setVisible(false);
                    this.overImage.setVisible(true);
                    this.downImage.setVisible(false);
                    this.disabledImage.setVisible(false);
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                if (this.enabled) {
                    this.upImage.setVisible(true);
                    this.overImage.setVisible(false);
                    this.downImage.setVisible(false);
                    this.disabledImage.setVisible(false);
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                if (this.enabled) {
                    this.upImage.setVisible(false);
                    this.overImage.setVisible(false);
                    this.downImage.setVisible(true);
                    this.disabledImage.setVisible(false);

                    callback();
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                if (this.enabled) {
                    this.upImage.setVisible(false);
                    this.overImage.setVisible(true);
                    this.downImage.setVisible(false);
                    this.disabledImage.setVisible(false);
                }
            });
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.upImage.setVisible(true);
            this.overImage.setVisible(false);
            this.downImage.setVisible(false);
            this.disabledImage.setVisible(false);
            this.text.setTint(0x000000);
            this.input.cursor = 'pointer';
        } else {
            this.upImage.setVisible(false);
            this.overImage.setVisible(false);
            this.downImage.setVisible(false);
            this.disabledImage.setVisible(true);
            this.text.setTint(0xCCCCCC);
            this.input.cursor = 'not-allowed';
        }
    }
}

export default CustomButton;