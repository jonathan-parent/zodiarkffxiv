const GAME_SIZE = 800;
const ARENA_SIZE = 400;
const ANIMAL_SIZE = 80;
const ARENA_DEPTH = 0;
const ARENA_POSTDRAW_DEPTH = 1;
const BIRDS_POSTDRAW_DEPTH = 2;
const OTHER_POSTDRAW_DEPTH = 3;
const FIREWALL_DEPTH = 4;
const IMAGES_DEPTH = 5;
const TARGET_DEPTH = 6;
const ANIMATION_DURATIONS = {
    rotation: 1000,
    bird: 2000,
    snake: 2000,
    sigil: 2000,
    aigedon: 2000,
    adikia: 2000,
    firewall: 2000
};
const PATTERNS = [
    [
        // Paradeigma 1
        { type: 'bird', count: 4 }
    ],
    [
        // Paradeigma 2
        { type: 'bird', count: 2, arrangement: 'adjacent' },
        { type: 'aigedon' }
    ],
    [
        // Paradeigma 3
        { type: 'rotation' },
        { type: 'snake' },
        { type: 'sigil' }
    ],
    [
        // Paradeigma 4
        { type: 'snake' },
        { type: 'adikia' }
    ],
    [
        // Paradeigma 5
        { type: 'rotation' },
        { type: 'firewall' },
        { type: 'bird', count: 2 }
    ],
    [
        // Paradeigma 6
        { type: 'rotation' },
        { type: 'firewall' },
        { type: 'bird', count: 4 },
        { type: 'snake' }
    ],
    [
        // Paradeigma 7
        { type: 'rotation' },
        { type: 'firewall' },
        { type: 'snake' },
        { type: 'sigil' }
    ],
    [
        // Paradeigma 8
        { type: 'rotation' },
        { type: 'firewall' },
        { type: 'bird', count: 2, arrangement: 'across' },
        { type: 'sigil', side: 2, shape: 'square' }
    ],
    [
        // Paradeigma 9
        { type: 'rotation' },
        { type: 'firewall' },
        { type: 'bird', count: 4 },
        { type: 'snake' },
        { type: 'sigil' }
    ],
];

export default { GAME_SIZE, ARENA_SIZE, ANIMAL_SIZE, ARENA_DEPTH, FIREWALL_DEPTH, IMAGES_DEPTH, ARENA_POSTDRAW_DEPTH, BIRDS_POSTDRAW_DEPTH, OTHER_POSTDRAW_DEPTH, TARGET_DEPTH, ANIMATION_DURATIONS, PATTERNS };
