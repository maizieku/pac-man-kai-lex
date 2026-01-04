export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE'
}



export enum TileType {
  EMPTY = 0,
  WALL = 1,
  DOT = 2,
  POWER_PELLET = 3,
  GHOST_HOUSE = 4,
  BONUS = 5
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Position;
  dir: Direction;
  nextDir: Direction;
  speed: number;
}


export interface Ghost extends Entity {
  color: string;
  // isScared: boolean;
  isEaten: boolean;
  baseColor: string; // Hex code for fallback
  imgUrl: string;    // Photo URL
}

export interface GameState {
  score: number;
  lives: number;
  gameOver: boolean;
  won: boolean;
  paused: boolean;
}

export interface Gameman{
  name: string
}