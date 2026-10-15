/**
 * Pixel art of the AgentRepo avatar ("Repo", the hooded keeper).
 *
 * Editable source of truth for every frame: a 32×32 grid drawn with one
 * character per pixel. Change a letter here and both the live component and the
 * exported sprite sheet (`pnpm sprites`) update. `.` is transparent.
 *
 * Layers are drawn in this order: shadow → body → head → props → fx.
 * Head and body are split so the head can bob / squash one pixel against the
 * body without redrawing the whole figure.
 */

export const GRID = 32;

/** Palette keys used in the grids. `E` (eyes/mouth) follows `setup.colors.face`. */
export const PALETTE = {
  K: '#2a1320', // outline
  H: '#8a2e48', // hood
  h: '#5c1d35', // hood shadow
  L: '#c45c6e', // hood light
  F: '#f7dcaa', // face
  f: '#e2b384', // face shade
  W: '#fff4d6', // highlight / bubble
  E: 'currentColor', // eyes + mouth (themable)
  e: '#fff8e6', // eye shine
  C: '#e58c86', // cheeks
  G: '#f2b65a', // gold
  g: '#a8642e', // gold shade
  O: '#9c5a3c', // shield emblem
  Y: '#ffe39a', // gold light / sparkle
  S: '#0f3a4f', // terminal screen
  s: '#8ff4ff', // terminal glyph
  c: '#4fc9dc', // terminal bezel
  B: '#3a1c2b', // boots
  D: '#4b1d32', // cape hem
  M: '#7c2c43', // cape
  m: '#a54459', // cape light
  x: 'rgba(42,19,32,0.22)', // ground shadow
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** A sparse overlay: rows of pixels placed with their top-left corner at x,y. */
export interface Patch {
  x: number;
  y: number;
  rows: readonly string[];
}

const p = (x: number, y: number, ...rows: string[]): Patch => ({ x, y, rows });

/** Hood and face, rows 0–19 of the grid. */
export const HEAD: Patch = p(
  0,
  0,
  '................................',
  '......................KK........',
  '....................KKLhK.......',
  '.............KKKKKKKLHhK........',
  '...........KKLLLLHHHHHhK........',
  '..........KLLLHHHHHHHHHhK.......',
  '.........KLLHHHHHHHHHHHHhK......',
  '........KLLHHHHHHHHHHHHHHhK.....',
  '........KLHHHKKKKKKKKKKHHHhK....',
  '.......KLHHKKWWFFFFFFFFKKHhK....',
  '.......KLHKWWFFFFFFFFFFFFKHhK...',
  '.......KHHKWFFFFFFFFFFFFFKHhK...',
  '......KHHKFFFFFFFFFFFFFFFFKHhK..',
  '......KHHKFFFFFFFFFFFFFFFFKHhK..',
  '......KHHKFFFFFFFFFFFFFFFFKHhK..',
  '......KHHKFFFFFFFFFFFFFFFFKhhK..',
  '......KHhKfFFFFFFFFFFFFFFfKhhK..',
  '.......KhKffFFFFFFFFFFFFffKhK...',
  '.......KhhKKffffffffffffKKhhK...',
  '........KhhhKKKKKKKKKKKKhhhK....',
);

/** Cape and boots, rows 19–30 (row 19 repeats the neck so a raised head never leaves a gap). */
export const BODY: Patch = p(
  0,
  19,
  '........KhhhKKKKKKKKKKKKhhhK....',
  '.........KMMMMMMGGMMMMMMMK......',
  '........KmMMMMMMggMMMMMMMMK.....',
  '.......KmMMMMMMMMMMMMMMMMMMK....',
  '......KmmMMMMMMMMMMMMMMMMMMhK...',
  '......KmMMMMMMMMMMMMMMMMMMMhK...',
  '.....KmMMMMMMMMMMMMMMMMMMMMMhK..',
  '.....KmMMMMMMMMMMMMMMMMMMMMhhK..',
  '.....KKDMMMMMMMMMMMMMMMMMMDhKK..',
  '......KKDDDDDDDDDDDDDDDDDDDKK...',
  '..........KBBBK....KBBBK........',
  '.........KBBBBK....KBBBBK.......',
);

export const SHADOW: Patch = p(10, 31, 'xxxxxxxxxxxxx');

/** Terminal (left hand) and shield (right hand). The screen is a separate patch. */
export const PROPS: readonly Patch[] = [
  p(
    23,
    19,
    '.KKKKKK.',
    'KGGGGGGK',
    'KGYYOGGK',
    'KGYOOOGK',
    'KGGOOGgK',
    '.KGOGgK.',
    '..KGgK..',
    '...KK...',
  ),
  p(21, 22, 'KFFK', 'KfFK', '.KK.'),
  p(
    2,
    20,
    'KKKKKKKKKK',
    'KccccccccK',
    'KcSSSSSScK',
    'KcSSSSSScK',
    'KcSSSSSScK',
    'KcSSSSSScK',
    'KcSSSSSScK',
    'KccccccccK',
    'KKKKKKKKKK',
  ),
  p(11, 23, 'KFFK', 'KFfK', '.KK.'),
];

/** Terminal screen contents (6×5 at 4,22). */
export const SCREENS = {
  prompt: p(4, 22, 'SSSSSS', 'sSSSSS', 'SsSSSS', 'sSSssS', 'SSSSSS'),
  promptOff: p(4, 22, 'SSSSSS', 'sSSSSS', 'SsSSSS', 'sSSSSS', 'SSSSSS'),
  code1: p(4, 22, 'sssSSS', 'SSSSSS', 'SSSSSS', 'SSSSSS', 'SSSSSS'),
  code2: p(4, 22, 'sssSSS', 'SSSSSS', 'SsssSS', 'SSSSSS', 'SSSSSS'),
  code3: p(4, 22, 'sssSSS', 'SSSSSS', 'SsssSS', 'SSSSSS', 'ssSSSS'),
  ok: p(4, 22, 'SSSSSS', 'SSSSsS', 'SSSsSS', 'sSsSSS', 'SsSSSS'),
  alert: p(4, 22, 'SSsSSS', 'SSsSSS', 'SSsSSS', 'SSSSSS', 'SSsSSS'),
} as const;
export type ScreenKey = keyof typeof SCREENS;

/** Eyes, relative to the head layer. Each entry draws both eyes. */
export const EYES = {
  open: [p(13, 12, 'Ee', 'EE', 'EE'), p(21, 12, 'Ee', 'EE', 'EE')],
  closed: [p(13, 14, 'EE'), p(21, 14, 'EE')],
  happy: [p(12, 13, '.EE.', 'E..E'), p(20, 13, '.EE.', 'E..E')],
  up: [p(13, 11, 'Ee', 'EE'), p(21, 11, 'Ee', 'EE')],
  wide: [
    p(12, 11, 'EEE', 'EeE', 'EEE', 'EEE'),
    p(21, 11, 'EEE', 'EeE', 'EEE', 'EEE'),
  ],
  squeeze: [p(13, 12, 'E.', '.E', 'E.'), p(21, 12, '.E', 'E.', '.E')],
} as const;
export type EyesKey = keyof typeof EYES;

export const MOUTHS = {
  neutral: p(17, 16, 'EE'),
  smile: p(16, 16, 'E..E', '.EE.'),
  open: p(16, 16, '.EE.', 'ECCE', '.EE.'),
  o: p(17, 16, 'EE', 'EE'),
  hmm: p(18, 16, 'EE'),
} as const;
export type MouthKey = keyof typeof MOUTHS;

export const CHEEKS: readonly Patch[] = [p(11, 15, 'CC'), p(23, 15, 'CC')];

/** Effects drawn in the empty top-left corner so they never clip. */
export const FX = {
  think1: [p(5, 7, '.K.', 'KWK', '.K.')],
  think2: [
    p(5, 7, '.K.', 'KWK', '.K.'),
    p(2, 3, '.KK.', 'KWWK', 'KWWK', '.KK.'),
  ],
  think3: [
    p(5, 7, '.K.', 'KWK', '.K.'),
    p(2, 3, '.KK.', 'KWWK', 'KWWK', '.KK.'),
    p(0, 0, '.KKKKKK.', 'KWWWWWWK', 'KWEWEWEK', '.KKKKKK.'),
  ],
  sparkleA: [p(2, 6, '.Y.', 'YWY', '.Y.'), p(28, 3, 'Y')],
  sparkleB: [p(3, 7, 'Y'), p(27, 2, '.Y.', 'YWY', '.Y.')],
  bang: [p(4, 0, 'KKK', 'KGK', 'KGK', 'KGK', 'KKK', 'KGK', 'KKK')],
} as const;
export type FxKey = keyof typeof FX;
