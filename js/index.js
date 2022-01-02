import constants from './constants.js';
import CustomButton from './classes/CustomButton.js';
import Pattern from './classes/Pattern.js';

import AdikiaPattern from './classes/AdikiaPattern.js';
import AigedonPattern from './classes/AigedonPattern.js';
import BirdPattern from './classes/BirdPattern.js';
import FirewallPattern from './classes/FirewallPattern.js';
import RotationPattern from './classes/RotationPattern.js';
import SigilPattern from './classes/SigilPattern.js';
import SnakePattern from './classes/SnakePattern.js';

const config = {
    type: Phaser.AUTO,
    width: constants.GAME_SIZE,
    height: constants.GAME_SIZE,
    scale: {
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game',
    dom: {
        createContainer: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let rotation = false;
let animationDelay = 0;
let arena;
let arenaPostDraw;
let boss;
let target;
let draggingTarget = false;
let gameOver = false;
let patterns;
let confirmButton;
let nextButton;
let resultIcon;
let patternSelect;
let currentPatternText;
let nextPattern = -1;

// Assumes that if a rotation pattern is included it will be the first element of the config array
function createPatternsFromConfig(scene, config) {
    let parsedPatterns = [];
    if (Array.isArray(config)) {
        for (const pattern of config) {
            switch(pattern.type) {
                case 'rotation':
                    rotation = Math.random() > 0.5 ? 'clockwise' : 'counterclockwise';
                    parsedPatterns.push(new RotationPattern(scene, rotation, animationDelay));
                    animationDelay += constants.ANIMATION_DURATIONS.rotation;
                    break;
                case 'bird':
                    let animalTypes;
                    let meleeSafeSpot = true;
                    do {
                        if (pattern.arrangement && pattern.count === 2) {
                            animalTypes = Array(4).fill('bird', 0, 4);
                            const firstIndex = Math.floor(Math.random() * 4);
                            let secondIndex;
                            if (pattern.arrangement === 'adjacent') {
                                secondIndex = (firstIndex + 1) % 4;
                            } else if (pattern.arrangement === 'across') {
                                secondIndex = (firstIndex + 2) % 4;
                            }
                            animalTypes[firstIndex] = 'behemoth';
                            animalTypes[secondIndex] = 'behemoth';
                        } else {
                            // Add pattern.count birds, then fill the rest with behemoths
                            animalTypes = Array(4).fill('bird', 0, pattern.count);
                            if (pattern.count < 4) {
                                animalTypes.fill('behemoth', pattern.count, 4);

                                // Suffle the animal positions
                                animalTypes.sort((a, b) => 0.5 - Math.random());
                            }
                        }
                        if (pattern.count === 2 && (
                            (!rotation && animalTypes[0] === 'behemoth' && animalTypes[1] === 'behemoth') ||
                            (rotation === 'clockwise' && animalTypes[0] === 'behemoth' && animalTypes[3] === 'behemoth') ||
                            (rotation === 'counterclockwise' && animalTypes[1] === 'behemoth' && animalTypes[2] === 'behemoth')
                        )) {
                            meleeSafeSpot = false;
                        } else {
                            meleeSafeSpot = true;
                        }
                    } while (!meleeSafeSpot);
                    parsedPatterns.push(new BirdPattern(scene, rotation, animalTypes, animationDelay));
                    animationDelay += constants.ANIMATION_DURATIONS.bird;
                    break;
                case 'snake':
                    // Side is one of 0-1-2-3 for north-east-south-west. No rotation = always east/west, any rotation = always north/south
                    const rand = Math.round(Math.random()) * 2;
                    const snakeSide = rotation ? rand : rand + 1;
                    // 2 possible patterns for each side, so this is randomly 0 or 1
                    const snakePattern = Math.round(Math.random());
                    parsedPatterns.push(new SnakePattern(scene, rotation, snakeSide, snakePattern, animationDelay));
                    animationDelay += constants.ANIMATION_DURATIONS.snake;
                    break;
                case 'firewall':
                    // Firewall without rotation doesn't do anything
                    if (rotation) {
                        // 2 possible patterns so this is randomly 0 or 1
                        const firewallPattern = Math.round(Math.random());
                        parsedPatterns.push(new FirewallPattern(scene, rotation, firewallPattern, animationDelay));
                        animationDelay += constants.ANIMATION_DURATIONS.firewall;
                    }
                    break;
                case 'sigil':
                    // Side is one of 0-1-2-3 for north-east-south-west. If not specified, pick random between east (1) or west (3).
                    const sigilSide = pattern.hasOwnProperty('side') ? pattern.side : Math.round(Math.random()) * 2 + 1;
                    // Shape is triangle or square. If not specified, pick a random one
                    const sigilShape = pattern.hasOwnProperty('shape') ? pattern.shape : (Math.random() > 0.5 ? 'triangle' : 'square');
                    parsedPatterns.push(new SigilPattern(scene, rotation, sigilSide, sigilShape, animationDelay));
                    animationDelay += constants.ANIMATION_DURATIONS.sigil;
                    break;
                case 'aigedon':
                    // Side is either NW or NE, represented as 0 or 1
                    const aigedonSide = Math.round(Math.random());
                    parsedPatterns.push(new AigedonPattern(scene, rotation, aigedonSide, boss, animationDelay));
                    animationDelay += constants.ANIMATION_DURATIONS.aigedon;
                    break;
                case 'adikia':
                    parsedPatterns.push(new AdikiaPattern(scene, rotation, boss, animationDelay));
                    animationDelay += constants.ANIMATION_DURATIONS.adikia;
                    break;
                default:
                    break;
            }
        }
    }

    return parsedPatterns;
}

function verifyTargetPosition(scene) {
    // Check if target respects all patterns
    let safe = false;
    if (target) {
        safe = true;
        for (const pattern of patterns) {
            if (!pattern.checkClick(new Phaser.Geom.Point(target.x, target.y))) {
                safe = false;
            }
        }
    } else {
        console.log('No target set...');
    }
    
    return safe;
}

function checkResult(scene) {
    gameOver = true;
    confirmButton.setEnabled(false);
    postDraw(scene);

    setTimeout(() => {
        let safe = verifyTargetPosition(scene);

        if (resultIcon) {
            resultIcon.destroy();
        }
        if (safe) {
            resultIcon = scene.add.image(700, 700, 'checkmark');
        } else {
            resultIcon = scene.add.image(700, 700, 'redx');
        }

        confirmButton.setVisible(false);
        nextButton.setVisible(true);
    }, animationDelay);
}

function postDraw(scene) {
    if (rotation) {
        scene.tweens.add({
            targets: arena,
            ease: 'Linear',
            duration: constants.ANIMATION_DURATIONS.rotation,
            angle: rotation === 'clockwise' ? 90 : -90
        });
    }

    let anyBird = false;
    // Check if there's a bird pattern
    for (const pattern of patterns) {
        if (pattern instanceof BirdPattern) {
            anyBird = true;
        }
    }

    if (!anyBird) {
        // As a starting point whole arena is green
        setTimeout(() => {
            arenaPostDraw = scene.add.rectangle(constants.ARENA_SIZE, constants.ARENA_SIZE, constants.GAME_SIZE / 2, constants.GAME_SIZE / 2, 0x27B24A);
            arenaPostDraw.depth = constants.ARENA_POSTDRAW_DEPTH;
        }, rotation ? 2000 : 1000);
    }

    for (const pattern of patterns) {
        pattern.postDraw();
    }
}

function newPattern(scene) {
    // Patterns
    let nextIndex = Math.floor(Math.random() * constants.PATTERNS.length);
    if (nextPattern >= 0 && nextPattern < constants.PATTERNS.length) {
        nextIndex = nextPattern;
    }
    
    patterns = createPatternsFromConfig(scene, constants.PATTERNS[nextIndex]);
    currentPatternText.text = 'Paradeigma #'+(++nextIndex);
    //patterns = createPatternsFromConfig(scene, constants.PATTERNS[4]);
    /*patterns = createPatternsFromConfig(scene, [
        { type: 'sigil' }
    ]);*/

    for (const pattern of patterns) {
        pattern.preDraw();
    }
}

function resetScene() {
    if (arenaPostDraw) {
        arenaPostDraw.destroy();
    }
    if (target) {
        target.destroy();
    }
    if (resultIcon) {
        resultIcon.destroy();
    }
    // Reset all patterns
    for (const pattern of patterns) {
        pattern.reset();
    }

    confirmButton.setVisible(true);
    confirmButton.setEnabled(false);
    nextButton.setVisible(false);

    arena.angle = 0;
    animationDelay = 0;
    rotation = false;
    gameOver = false;
}

function preload() {
    this.load.image('arena', 'assets/arena.png');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('behemoth', 'assets/behemoth.png');
    this.load.image('snake', 'assets/snake.png');
    this.load.image('target', 'assets/target.png');
    this.load.image('checkmark', 'assets/checkmark.png');
    this.load.image('redx', 'assets/redx.png');
    this.load.image('arrow', 'assets/arrow.png');
    this.load.image('firewall', 'assets/firewall.png');
    this.load.image('triangle', 'assets/triangle.png');
    this.load.image('square', 'assets/square.png');
    this.load.image('boss', 'assets/boss.png');
    this.load.image('aigedon', 'assets/aigedon.png');
    this.load.image('adikia', 'assets/adikia.png');

    this.load.image('buttonDown', 'assets/buttonDown.png');
    this.load.image('buttonUp', 'assets/buttonUp.png');
    this.load.image('buttonOver', 'assets/buttonOver.png');
    this.load.image('buttonDisabled', 'assets/buttonDisabled.png');

    this.load.html('patternSelect', 'components/PatternSelect.html');
}

function create() {
    // Arena
    arena = this.add.image(400, 400, 'arena');
    arena.depth = constants.ARENA_DEPTH;

    // Boss
    boss = this.add.image(400, 110, 'boss');
    boss.depth = constants.IMAGES_DEPTH;

    // Target
    arena.setInteractive({ cursor: 'pointer' })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, (pointer) => {
            // Avoid target directly on the edges
            if (!gameOver && pointer.x !== 200 && pointer.x !== 600 && pointer.y !== 200 && pointer.y !== 200) {
                // Destroy old target if any
                if (target) {
                    target.destroy();
                }

                // Draw new target
                target = this.add.image(pointer.x, pointer.y, 'target');
                target.depth = constants.TARGET_DEPTH;
                draggingTarget = true;
                confirmButton.setEnabled(true);
            }
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, (pointer) => {
            // Avoid target directly on the edges
            if (!gameOver && pointer.x !== 200 && pointer.x !== 600 && pointer.y !== 200 && pointer.y !== 200) {
                if (target && draggingTarget) {
                    target.setPosition(pointer.x, pointer.y);
                }
            }
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer) => {
            draggingTarget = false;
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, (pointer) => {
            draggingTarget = false;
        });

    // Buttons
    let scene = this;
    confirmButton = new CustomButton(this, 400, 750, 'Confirm', () => { checkResult(scene); }, 'buttonUp', 'buttonOver', 'buttonDown', 'buttonDisabled');
    confirmButton.setEnabled(false);
    this.add.existing(confirmButton);

    nextButton = new CustomButton(this, 400, 750, 'Next', () => { resetScene(); newPattern(scene); }, 'buttonUp', 'buttonOver', 'buttonDown', 'buttonDisabled');
    nextButton.setVisible(false);
    this.add.existing(nextButton);

    // Pattern select
    this.add.text(20, 640, 'Current pattern:');
    currentPatternText = this.add.text(20, 660, '');
    this.add.text(20, 690, 'Next pattern:');
    patternSelect = this.add.dom(20, 710).createFromCache('patternSelect');
    patternSelect.setOrigin(0, 0);
    patternSelect.addListener('click');

    patternSelect.on('click', (e) => {
        nextPattern = e.target.value;
    });

    newPattern(scene);
}

function update() {

}