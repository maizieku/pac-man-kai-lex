import { TileType } from './types';

// Replace these URLs with your actual photos
// For local images: Create a 'public/images' folder and use paths like '/images/filename.png'
export const SPRITES = {
  // PACMAN: Math.random() > 0.5 ? '/images/lex.png' : '/images/kai.png',
  KAI: '/images/kai.png',
  LEX: '/images/lex.png',
  // BLINKY: 'images/dori.png', // Adult 1 (Red)
  // PINKY: 'images/nick.png',  // Adult 2 (Pink)
  // INKY: 'images/aud.png',   // Adult 3 (Cyan)
  // CLYDE: 'images/dada.png',  // Adult 4 (Orange)
};

export const GHOST_SPRITES = [
  'images/dori.png',
  'images/nick.png',
  'images/aud.png',
  'images/dada.png',
  'images/java.png',
];

export const AUDIO = {
  BACKGROUND: '/sounds/background.mp3', // Replace with your background music file
  POWER_MODE: '/sounds/power_mode.mp3', // Replace with your frozen/countdown sound file
};

export const CELL_SIZE = 28; // Base pixels per cell, scales with CSS
export const GAME_SPEED = 150; // Milliseconds per tick (approx)
export const PACMAN_SPEED = 0.12; // Cells per frame
export const GHOST_SPEED = 0.08;
export const SCARED_GHOST_SPEED = 0.08;

// 0: Empty, 1: Wall, 2: Dot, 3: Power, 4: House, 5: Bonus
// Designed to spell KAI (Top) and LEX (Bottom) slightly abstractly
const W = TileType.WALL;
const D = TileType.DOT;
const P = TileType.POWER_PELLET;
const E = TileType.EMPTY;
const H = TileType.GHOST_HOUSE;
const B = TileType.BONUS;

const BASE_MAP = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,P,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,P,W], // Power Pellets added
  // K A I Area
  [W,D,W,E,E,W,D,D,W,W,D,D,D,W,W,W,W,W,B,D,W],
  [W,D,W,W,W,E,D,W,E,E,W,D,D,E,E,W,E,E,D,D,W],
  [W,D,W,E,E,W,D,W,W,W,W,D,D,E,E,W,E,E,D,D,W],
  [W,D,W,E,E,W,D,W,E,E,W,D,D,W,W,W,W,W,D,D,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  
  [W,D,W,W,W,W,D,W,W,H,H,W,W,D,D,W,W,W,W,D,W],
  [W,P,D,D,D,D,D,W,H,H,H,H,W,D,D,D,D,D,D,P,W], // Existing Power Pellets
  [W,D,W,W,W,W,D,W,W,W,W,W,W,D,D,W,W,W,W,D,W],
  
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W], // Bonus (Croissant) added in center
  // L E X Area
  [W,D,W,D,D,D,D,W,W,W,W,D,D,W,D,D,D,W,D,D,W],
  [W,D,W,D,D,D,D,W,E,E,E,D,D,E,W,E,W,E,D,D,W],
  [W,D,W,D,D,D,D,W,W,W,W,D,D,E,E,W,B,E,D,D,W],
  [W,D,W,D,D,D,D,W,E,E,B,D,D,E,W,E,W,E,D,D,W],
  [W,D,W,W,W,W,D,W,W,W,W,D,D,W,D,D,D,W,D,D,W],
  
  [W,P,D,D,D,D,D,D,D,D,P,D,D,D,D,D,D,D,D,P,W], // Power Pellets added
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

export const INITIAL_MAP = BASE_MAP.map(row => row.map(cell => {
  if (cell === D && Math.random() < 0.01) {
    return B;
  }
  if (cell === D && Math.random() < 0.05) {
    return E;
  }
  if (cell === D && Math.random() < 0.01) {
    return P;
  }
  return cell;
}));



export const MAP_WIDTH = INITIAL_MAP[0].length;
export const MAP_HEIGHT = INITIAL_MAP.length;