import { TileType } from './types';

// Replace these URLs with your actual photos
// For local images: Create a 'public/images' folder and use paths like '/images/filename.png'
export const SPRITES = {
  PACMAN: Math.random() > 0.5 ? '/images/lex.png' : '/images/kai.png',
  BLINKY: 'https://picsum.photos/id/1012/200/200', // Adult 1 (Red)
  PINKY: 'https://picsum.photos/id/1027/200/200',  // Adult 2 (Pink)
  INKY: 'https://picsum.photos/id/338/200/200',   // Adult 3 (Cyan)
  CLYDE: 'https://picsum.photos/id/334/200/200',  // Adult 4 (Orange)
  CROISSANT: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Croissant_icon.svg/512px-Croissant_icon.svg.png', // Bonus Item
};

export const CELL_SIZE = 28; // Base pixels per cell, scales with CSS
export const GAME_SPEED = 150; // Milliseconds per tick (approx)
export const PACMAN_SPEED = 0.12; // Cells per frame
export const GHOST_SPEED = 0.08;
export const SCARED_GHOST_SPEED = 0.8;

// 0: Empty, 1: Wall, 2: Dot, 3: Power, 4: House, 5: Bonus
// Designed to spell KAI (Top) and LEX (Bottom) slightly abstractly
const W = TileType.WALL;
const D = TileType.DOT;
const P = TileType.POWER_PELLET;
const E = TileType.EMPTY;
const H = TileType.GHOST_HOUSE;
const B = TileType.BONUS;

export const INITIAL_MAP = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,P,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,P,W], // Power Pellets added
  // K A I Area
  [W,D,W,E,E,W,D,D,W,W,D,D,D,W,W,W,W,W,D,D,W],
  [W,D,W,W,W,D,D,W,E,E,W,D,E,D,E,W,E,D,D,D,W],
  [W,D,W,E,E,W,D,W,W,W,W,D,D,D,E,W,E,D,D,D,W],
  [W,D,W,E,E,W,D,W,D,D,W,D,D,W,W,W,W,W,D,D,W],
  [W,D,D,D,D,D,D,D,D,D,D,B,D,D,D,D,D,D,D,D,W],
  
  [W,D,W,W,W,W,D,W,W,H,H,W,W,D,D,W,W,W,W,D,W],
  [W,P,D,D,D,D,D,W,H,H,H,H,W,D,D,D,D,D,D,P,W], // Existing Power Pellets
  [W,D,W,W,W,W,D,W,W,W,W,W,W,D,D,W,W,W,W,D,W],
  
  [W,D,D,D,D,D,D,D,D,D,B,D,D,D,D,D,D,D,D,D,W], // Bonus (Croissant) added in center
  // L E X Area
  [W,D,W,D,D,D,D,W,W,W,W,D,D,W,D,D,D,W,D,D,W],
  [W,D,W,D,D,D,D,W,E,B,E,D,D,E,W,D,W,E,D,D,W],
  [W,D,W,D,D,D,D,W,W,W,W,D,D,E,E,W,E,E,D,D,W],
  [W,D,W,D,D,D,D,W,E,E,D,D,D,E,W,D,W,E,D,D,W],
  [W,D,W,W,W,W,D,W,W,W,W,D,D,W,D,D,D,W,D,D,W],
  
  [W,P,D,D,D,D,D,D,D,D,P,D,D,D,D,D,D,D,D,P,W], // Power Pellets added
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

export const MAP_WIDTH = INITIAL_MAP[0].length;
export const MAP_HEIGHT = INITIAL_MAP.length;