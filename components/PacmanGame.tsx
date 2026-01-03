import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { INITIAL_MAP, MAP_HEIGHT, MAP_WIDTH, SPRITES, PACMAN_SPEED, GHOST_SPEED, SCARED_GHOST_SPEED, CELL_SIZE } from '../constants';
import { Direction, Entity, Ghost, Position, TileType, GameState } from '../types';

// --- Helper Functions ---

const gameMan = Math.random() > 0.5 ? 'KAI' : 'LEX';

const isWall = (x: number, y: number, map: number[][]) => {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
  return map[y][x] === TileType.WALL;
};

const getOppositeDir = (dir: Direction) => {
  switch (dir) {
    case Direction.UP: return Direction.DOWN;
    case Direction.DOWN: return Direction.UP;
    case Direction.LEFT: return Direction.RIGHT;
    case Direction.RIGHT: return Direction.LEFT;
    default: return Direction.NONE;
  }
};

const getVector = (dir: Direction) => {
  switch (dir) {
    case Direction.UP: return { x: 0, y: -1 };
    case Direction.DOWN: return { x: 0, y: 1 };
    case Direction.LEFT: return { x: -1, y: 0 };
    case Direction.RIGHT: return { x: 1, y: 0 };
    default: return { x: 0, y: 0 };
  }
};

const roundPos = (pos: Position) => ({ x: Math.round(pos.x), y: Math.round(pos.y) });

// --- Components ---

interface EntitySpriteProps {
  entity: Entity | Ghost;
  imgUrl: string;
  className?: string;
}

const EntitySprite: React.FC<EntitySpriteProps> = ({ entity, imgUrl, className }) => {
  const isGhost = 'color' in entity;
  const ghost = entity as Ghost;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${entity.pos.x * CELL_SIZE}px`,
    top: `${entity.pos.y * CELL_SIZE}px`,
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`,
    transition: 'none', // Handle movement via requestAnimationFrame
    backgroundImage: `url(${imgUrl})`,
    backgroundSize: 'cover',
    borderRadius: '50%',
    zIndex: 10,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: isGhost ? (ghost.isScared ? '#0000FF' : ghost.color) : 'transparent',
    filter: isGhost && ghost.isScared ? 'invert(1)' : 'none',
  };
  
  // Rotate Pacman based on direction
  if (!isGhost) {
     let rotation = 0;
     if (entity.dir === Direction.DOWN) rotation = 90;
     if (entity.dir === Direction.LEFT) rotation = 180;
     if (entity.dir === Direction.UP) rotation = -90;
     style.transform = `rotate(${rotation}deg) scale(1.6)`;
     style.zIndex = 20;
  }

  return <div style={style} className={`shadow-lg ${className || ''}`} />;
};

export const PacmanGame: React.FC = () => {
  // --- State ---
  const [map, setMap] = useState<number[][]>(INITIAL_MAP.map(row => [...row]));
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    paused: true
  });

  const [pacman, setPacman] = useState<Entity>({
    id: 'pacman',
    pos: { x: 12, y: 15 }, // Start roughly between LEX
    dir: Direction.NONE,
    nextDir: Direction.NONE,
    speed: PACMAN_SPEED * 0.8
  });

  const [ghosts, setGhosts] = useState<Ghost[]>([
    { id: 'blinky', pos: { x: 9, y: 8 }, dir: Direction.LEFT, nextDir: Direction.UP, speed: GHOST_SPEED * 0.8, color: 'red', baseColor: 'red', imgUrl: SPRITES.BLINKY, isScared: false, isEaten: false },
    { id: 'pinky', pos: { x: 10, y: 8 }, dir: Direction.RIGHT, nextDir: Direction.UP, speed: GHOST_SPEED * 0.8, color: 'pink', baseColor: 'pink', imgUrl: SPRITES.PINKY, isScared: false, isEaten: false },
    { id: 'inky', pos: { x: 8, y: 8 }, dir: Direction.UP, nextDir: Direction.RIGHT, speed: GHOST_SPEED * 0.8, color: 'cyan', baseColor: 'cyan', imgUrl: SPRITES.INKY, isScared: false, isEaten: false },
    { id: 'clyde', pos: { x: 11, y: 8 }, dir: Direction.UP, nextDir: Direction.LEFT, speed: GHOST_SPEED * 0.8, color: 'orange', baseColor: 'orange', imgUrl: SPRITES.CLYDE, isScared: false, isEaten: false },
  ]);

  const [scaredTimer, setScaredTimer] = useState<number>(0);
  const [frozenTimer, setFrozenTimer] = useState<number>(0);

  // --- Logic ---

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.gameOver || gameState.won) return;
    
    // Prevent default scrolling for arrow keys
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    let newDir = Direction.NONE;
    if (e.key === 'ArrowUp') newDir = Direction.UP;
    if (e.key === 'ArrowDown') newDir = Direction.DOWN;
    if (e.key === 'ArrowLeft') newDir = Direction.LEFT;
    if (e.key === 'ArrowRight') newDir = Direction.RIGHT;

    if (newDir !== Direction.NONE) {
      if (gameState.paused) setGameState(prev => ({ ...prev, paused: false }));
      setPacman(p => ({ ...p, nextDir: newDir }));
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const moveEntity = (entity: Entity, mapData: number[][], currentSpeed: number): Entity => {
    let { x, y } = entity.pos;
    const intX = Math.round(x);
    const intY = Math.round(y);
    
    // Center alignment check (are we close enough to the center of a tile to turn?)
    const isCentered = Math.abs(x - intX) < currentSpeed * 0.55 && Math.abs(y - intY) < currentSpeed * 0.55;

    let currentDir = entity.dir;

    if (isCentered) {
      // Try to turn
      if (entity.nextDir !== Direction.NONE && entity.nextDir !== currentDir) {
        const nextVec = getVector(entity.nextDir);
        if (!isWall(intX + nextVec.x, intY + nextVec.y, mapData)) {
          currentDir = entity.nextDir;
          // Snap to grid when turning
          x = intX;
          y = intY;
        }
      }

      // Check if we hit a wall in current direction
      const vec = getVector(currentDir);
      if (isWall(intX + vec.x, intY + vec.y, mapData)) {
        // Stop
        return { ...entity, pos: { x: intX, y: intY }, dir: Direction.NONE };
      }
    }

    const vec = getVector(currentDir);
    const newX = x + vec.x * currentSpeed;
    const newY = y + vec.y * currentSpeed;

    return { ...entity, pos: { x: newX, y: newY }, dir: currentDir };
  };

  const moveGhost = (ghost: Ghost, mapData: number[][], pacmanPos: Position): Ghost => {
    if (ghost.isEaten) {
      // Logic to return to house could go here, for now just respawn logic simulated by simple movement
      // Or simply float around aimlessly
    }

    let speed = ghost.isScared ? SCARED_GHOST_SPEED * 0.6 : ghost.speed;
    
    let { x, y } = ghost.pos;
    const intX = Math.round(x);
    const intY = Math.round(y);
    const isCentered = Math.abs(x - intX) < speed * 0.55 && Math.abs(y - intY) < speed * 0.55;

    let currentDir = ghost.dir;

    if (isCentered) {
        // Ghosts decide direction at intersections
        const options: Direction[] = [];
        const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        
        directions.forEach(d => {
            const v = getVector(d);
            // Don't reverse direction unless necessary
            if (d === getOppositeDir(ghost.dir) && !ghost.isEaten) return;
            if (!isWall(intX + v.x, intY + v.y, mapData)) {
                options.push(d);
            }
        });

        if (options.length === 0) {
            // Dead end, must reverse
             const reverse = getOppositeDir(ghost.dir);
             const v = getVector(reverse);
             if(!isWall(intX + v.x, intY + v.y, mapData)) currentDir = reverse;
        } else {
            // Simple AI: Randomly choose valid direction
            // Improvement: bias towards Pacman if not scared
            if (Math.random() > 0.3 && !ghost.isScared && options.length > 1) {
                // Find dir that minimizes distance to pacman
                currentDir = options.sort((a, b) => {
                     const va = getVector(a);
                     const vb = getVector(b);
                     const distA = Math.hypot((intX + va.x) - pacmanPos.x, (intY + va.y) - pacmanPos.y);
                     const distB = Math.hypot((intX + vb.x) - pacmanPos.x, (intY + vb.y) - pacmanPos.y);
                     return distA - distB;
                })[0];
            } else {
                 currentDir = options[Math.floor(Math.random() * options.length)];
            }
        }
        
        // Snap
        x = intX;
        y = intY;
    }

    const vec = getVector(currentDir);
    return { ...ghost, pos: { x: x + vec.x * speed, y: y + vec.y * speed }, dir: currentDir };
  };

  const updateLoop = (delta: number) => {
    if (gameState.paused || gameState.gameOver || gameState.won) return;

    // 1. Move Pacman
    const newPacman = moveEntity(pacman, map, pacman.speed);
    
    // 2. Check Collisions (Dots)
    const px = Math.round(newPacman.pos.x);
    const py = Math.round(newPacman.pos.y);
    const tile = map[py][px];
    
    if (tile === TileType.DOT) {
      const newMap = [...map];
      newMap[py] = [...newMap[py]];
      newMap[py][px] = TileType.EMPTY;
      setMap(newMap);
      setGameState(prev => ({ ...prev, score: prev.score + 10 }));
    } else if (tile === TileType.POWER_PELLET) {
      const newMap = [...map];
      newMap[py] = [...newMap[py]];
      newMap[py][px] = TileType.EMPTY;
      setMap(newMap);
      setGameState(prev => ({ ...prev, score: prev.score + 50 }));
      setScaredTimer(600); // frames roughly
      setFrozenTimer(300); // 5 seconds roughly
      setGhosts(prev => prev.map(g => ({ ...g, isScared: true })));
    } else if (tile === TileType.BONUS) {
      const newMap = [...map];
      newMap[py] = [...newMap[py]];
      newMap[py][px] = TileType.EMPTY;
      setMap(newMap);
      setGameState(prev => ({ ...prev, score: prev.score + 500 }));
    }

    setPacman(newPacman);

    // 3. Move Ghosts
    let hitPacman = false;
    const newGhosts = ghosts.map(g => {
        let intelligentGhost = g;
        
        if (frozenTimer <= 0) {
            intelligentGhost = moveGhost(g, map, newPacman.pos);
        }
        
        // Collision with Pacman
        const dist = Math.hypot(intelligentGhost.pos.x - newPacman.pos.x, intelligentGhost.pos.y - newPacman.pos.y);
        if (dist < 0.8) {
            if (g.isScared && !g.isEaten) {
                 // Eat Ghost
                 setGameState(prev => ({ ...prev, score: prev.score + 200 }));
                 return { ...intelligentGhost, isEaten: true, isScared: false, pos: { x: 10, y: 8 } }; // Respawn logic simplified
            } else if (!g.isEaten) {
                hitPacman = true;
            }
        }
        return intelligentGhost;
    });

    setGhosts(newGhosts);

    if (hitPacman) {
        if (gameState.lives > 1) {
             setGameState(prev => ({ ...prev, lives: prev.lives - 1, paused: true }));
             // Reset positions
             setPacman(p => ({ ...p, pos: { x: 10, y: 15 }, dir: Direction.NONE, nextDir: Direction.NONE }));
             setGhosts(prev => prev.map((g, i) => ({ ...g, pos: { x: 9 + (i%3), y: 7 + Math.floor(i/3) }, dir: Direction.NONE })));
        } else {
             setGameState(prev => ({ ...prev, lives: 0, gameOver: true }));
        }
    }

    // 4. Scared Timer
    if (scaredTimer > 0) {
        setScaredTimer(prev => prev - 1);
        if (scaredTimer === 1) {
            setGhosts(prev => prev.map(g => ({ ...g, isScared: false })));
        }
    }

    if (frozenTimer > 0) {
        setFrozenTimer(prev => prev - 1);
    }

    // 5. Win Condition
    // Check if any dots left
    const dotsLeft = map.some(row => row.includes(TileType.DOT) || row.includes(TileType.POWER_PELLET));
    if (!dotsLeft) {
        setGameState(prev => ({ ...prev, won: true }));
    }
  };

  useGameLoop(updateLoop, gameState.paused || gameState.gameOver || gameState.won);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-4">
      <div className="mb-4 flex justify-between w-full max-w-lg text-yellow-400 text-xl font-bold tracking-widest">
        <div>SCORE: {gameState.score} </div>
        <div>{gameMan} MAN</div>
        <div className="flex gap-2">
            {Array.from({length: Math.max(0, gameState.lives)}).map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-yellow-400" />
            ))}
        </div>
      </div>

      <div className="relative bg-black rounded-lg shadow-[0_0_20px_rgba(30,64,175,0.6)]"
           style={{ width: MAP_WIDTH * CELL_SIZE, height: MAP_HEIGHT * CELL_SIZE }}>
        
        {/* Render Map */}
        {map.map((row, y) => (
            <div key={y} className="flex">
                {row.map((cell, x) => (
                    <div key={`${x}-${y}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} className="flex items-center justify-center">
                        {cell === TileType.WALL && <div className="w-full h-full bg-blue-900/40 border border-blue-800 rounded-sm" />}
                        {cell === TileType.DOT && <div className="w-1.5 h-1.5 bg-pink-200 rounded-full" />}
                        {cell === TileType.POWER_PELLET && <div className="w-4 h-4 bg-pink-400 rounded-full animate-pulse" />}
                        {cell === TileType.GHOST_HOUSE && <div className="w-full h-full bg-transparent" />}
                        {cell === TileType.BONUS && (
                            <div className="flex items-center justify-center w-full h-full animate-bounce text-lg leading-none">
                              🥐
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ))}

        {/* Entities */}
        <EntitySprite entity={pacman} imgUrl={gameMan === 'KAI' ? SPRITES.KAI : SPRITES.LEX}  />
        {ghosts.map(ghost => (
            <EntitySprite 
                key={ghost.id} 
                entity={ghost} 
                imgUrl={ghost.imgUrl} 
            />
        ))}

        {/* Overlays */}
        {gameState.paused && !gameState.gameOver && !gameState.won && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                <p className="text-white animate-pulse text-lg">PRESS ARROW KEYS TO START</p>
            </div>
        )}

        {gameState.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
                <p className="text-red-500 text-3xl mb-4 font-bold">GAME OVER</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                >
                    TRY AGAIN
                </button>
            </div>
        )}

        {gameState.won && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
                <p className="text-green-400 text-3xl mb-4 font-bold">YOU WON!</p>
                <p className="text-white mb-4">Final Score: {gameState.score}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                >
                    PLAY AGAIN
                </button>
            </div>
        )}
      </div>

      <div className="mt-8 text-gray-500 text-xs text-center max-w-md">
        <p>USE ARROW KEYS OR SWIPE TO MOVE</p>
        <p className="mt-2">GHOSTS ARE "DORI" "NICK" "TT" "DADA"</p>
        <p className="mt-2">WALLS SPELL "KAI" & "LEX"</p>
      </div>
    </div>
  );
};