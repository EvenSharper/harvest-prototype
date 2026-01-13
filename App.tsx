import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WORLD_WIDTH, WORLD_HEIGHT, 
  INITIAL_INVENTORY, 
  MS_PER_GAME_MINUTE, 
  CROP_GROWTH_TIME,
  TICK_RATE_MS,
  DAY_START_HOUR,
  NIGHT_START_HOUR
} from './constants';
import { 
  TileType, TileData, Player, GameTime, ToolType, CropState, InventoryItem 
} from './types';
import Tile from './components/World/Tile';
import HUD from './components/UI/HUD';
import MenuModal from './components/UI/MenuModal';

// --- INITIAL STATE HELPERS ---

const generateWorld = (): TileData[] => {
  const tiles: TileData[] = [];
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      let type = TileType.GRASS;
      let collidable = false;

      // Simple procedural generation: Pond in the middle
      const dx = x - WORLD_WIDTH / 2;
      const dy = y - WORLD_HEIGHT / 2;
      if (dx * dx + dy * dy < 5) {
        type = TileType.WATER;
        collidable = true;
      }
      
      // Some rocks
      if (Math.random() > 0.95 && type !== TileType.WATER) {
        type = TileType.ROCK;
        collidable = true;
      }

      tiles.push({
        x, y, type,
        isTilled: false,
        isWatered: false,
        crop: null,
        collidable
      });
    }
  }
  return tiles;
};

// --- APP COMPONENT ---

const App: React.FC = () => {
  // --- STATE ---
  const [grid, setGrid] = useState<TileData[]>(generateWorld);
  const [player, setPlayer] = useState<Player>({ x: 5, y: 5, facing: 'DOWN', selectedHotbarIndex: 0 });
  const [time, setTime] = useState<GameTime>({ day: 1, hour: 6, minute: 0 });
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  // Refs for loop
  const timeRef = useRef(time);
  timeRef.current = time;

  // --- GAME LOOP & TIME ---
  useEffect(() => {
    const timer = setInterval(() => {
      if (isMenuOpen) return;

      setTime(prev => {
        let { day, hour, minute } = prev;
        minute += 1;
        if (minute >= 60) {
          minute = 0;
          hour += 1;
          if (hour >= 24) {
            hour = 0;
            day += 1;
            // New Day Logic trigger
            handleNewDay(day);
          }
        }
        return { day, hour, minute };
      });

    }, MS_PER_GAME_MINUTE);

    return () => clearInterval(timer);
  }, [isMenuOpen]);

  // Handle Daily Updates (Crop growth, Soil drying)
  const handleNewDay = (newDay: number) => {
    setGrid(prevGrid => {
      return prevGrid.map(tile => {
        let newTile = { ...tile };

        // 1. Grow Crops if watered
        if (newTile.crop && newTile.crop.state !== CropState.DEAD && newTile.crop.state !== CropState.MATURE) {
          if (newTile.isWatered) {
            newTile.crop = {
              ...newTile.crop,
              daysWatered: newTile.crop.daysWatered + 1,
            };

            const daysNeeded = CROP_GROWTH_TIME[newTile.crop.type] || 1;
            if (newTile.crop.daysWatered >= daysNeeded) {
               newTile.crop.state = CropState.MATURE;
            } else {
               // Visualize growth stages? For now just simplified states
               newTile.crop.state = CropState.GROWING;
            }
          }
        }

        // 2. Dry Soil
        newTile.isWatered = false;
        
        // 3. Revert untilled soil if empty
        if (newTile.isTilled && !newTile.crop && Math.random() > 0.7) {
            newTile.isTilled = false;
        }

        return newTile;
      });
    });
  };

  // --- PLAYER ACTIONS ---

  const getTargetTileIndex = (p: Player): number => {
    let tx = p.x;
    let ty = p.y;
    switch (p.facing) {
      case 'UP': ty -= 1; break;
      case 'DOWN': ty += 1; break;
      case 'LEFT': tx -= 1; break;
      case 'RIGHT': tx += 1; break;
    }
    if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) return -1;
    return ty * WORLD_WIDTH + tx;
  };

  const interact = useCallback(() => {
    const targetIdx = getTargetTileIndex(player);
    if (targetIdx === -1) return;

    setGrid(prev => {
      const newGrid = [...prev];
      const tile = { ...newGrid[targetIdx] };
      const selectedItem = inventory[player.selectedHotbarIndex];

      // Logic Table
      if (!selectedItem) return prev;

      // 1. HOE
      if (selectedItem.type === ToolType.HOE) {
        if (tile.type === TileType.GRASS && !tile.crop) {
           tile.type = TileType.SOIL;
           tile.isTilled = true;
        } else if (tile.type === TileType.SOIL && !tile.isTilled) {
           tile.isTilled = true;
        }
      }

      // 2. WATERING CAN
      else if (selectedItem.type === ToolType.WATERING_CAN) {
        if (tile.type === TileType.SOIL && tile.isTilled) {
          tile.isWatered = true;
        }
      }

      // 3. SEEDS
      else if (selectedItem.type.startsWith('SEED_')) {
        if (tile.type === TileType.SOIL && tile.isTilled && !tile.crop) {
          if (selectedItem.count > 0) {
            tile.crop = {
              type: selectedItem.type,
              state: CropState.SEED,
              daysPlanted: 0,
              daysWatered: 0
            };
            // Consume Seed (Need to update inventory separately, but for simplicity we modify state here and sync inventory later or use reducer)
            // Ideally we dispatch an action. For this prototype, we'll just handle grid here and update inventory via effect or ref.
            decrementInventory(player.selectedHotbarIndex);
          }
        }
      }

      // 4. HAND (Harvest)
      else if (selectedItem.type === ToolType.HAND) {
         if (tile.crop && tile.crop.state === CropState.MATURE) {
            // Harvest logic: Give item (not fully implemented item pickup, just clear crop)
            tile.crop = null;
            tile.isTilled = false; // Reset soil on harvest
            // In a real game, add result to inventory
            console.log("Harvested!");
         }
      }

      newGrid[targetIdx] = tile;
      return newGrid;
    });
  }, [player, inventory]);

  const decrementInventory = (index: number) => {
    setInventory(prev => {
      const next = [...prev];
      if (next[index].count > 0) {
        next[index] = { ...next[index], count: next[index].count - 1 };
      }
      return next;
    });
  };

  // --- INPUT HANDLING ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen) {
         if (e.key === 'Escape' || e.key === 'm') setIsMenuOpen(false);
         return;
      }

      // Hotbar
      if (['1','2','3','4','5'].includes(e.key)) {
        setPlayer(p => ({ ...p, selectedHotbarIndex: parseInt(e.key) - 1 }));
        return;
      }

      // Menu
      if (e.key === 'm' || e.key === 'Tab') {
          e.preventDefault();
          setIsMenuOpen(true);
          return;
      }

      // Interaction
      if (e.key === ' ') {
        interact();
        return;
      }

      // Movement
      let dx = 0;
      let dy = 0;
      let newFacing = player.facing;

      if (e.key === 'ArrowUp' || e.key === 'w') { dy = -1; newFacing = 'UP'; }
      if (e.key === 'ArrowDown' || e.key === 's') { dy = 1; newFacing = 'DOWN'; }
      if (e.key === 'ArrowLeft' || e.key === 'a') { dx = -1; newFacing = 'LEFT'; }
      if (e.key === 'ArrowRight' || e.key === 'd') { dx = 1; newFacing = 'RIGHT'; }

      if (dx !== 0 || dy !== 0) {
        const nextX = player.x + dx;
        const nextY = player.y + dy;

        // Bounds Check
        if (nextX >= 0 && nextX < WORLD_WIDTH && nextY >= 0 && nextY < WORLD_HEIGHT) {
            // Collision Check
            const targetIdx = nextY * WORLD_WIDTH + nextX;
            if (!grid[targetIdx].collidable) {
              setPlayer(p => ({ ...p, x: nextX, y: nextY, facing: newFacing }));
            } else {
              setPlayer(p => ({ ...p, facing: newFacing })); // Just turn
            }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, grid, isMenuOpen, interact]);

  // --- RENDER HELPERS ---

  // Calculate day/night cycle opacity
  const getAmbientLight = () => {
    const h = time.hour;
    if (h >= DAY_START_HOUR && h < NIGHT_START_HOUR) return 0; // Day
    if (h >= NIGHT_START_HOUR && h < 22) return 0.3; // Dusk
    if (h >= 22 || h < 5) return 0.7; // Night
    return 0.4; // Dawn
  };

  const targetIdx = getTargetTileIndex(player);

  return (
    <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      
      {/* Game Viewport */}
      <div 
        className="relative bg-slate-900 shadow-2xl overflow-hidden"
        style={{ width: WORLD_WIDTH * 40, height: WORLD_HEIGHT * 40 }} // 40px tiles
      >
        {/* The Grid */}
        <div 
           className="grid"
           style={{ 
             gridTemplateColumns: `repeat(${WORLD_WIDTH}, 1fr)`,
             width: '100%', height: '100%'
           }}
        >
          {grid.map((tile, i) => (
            <Tile 
              key={`${tile.x}-${tile.y}`} 
              data={tile} 
              isTargeted={i === targetIdx}
            />
          ))}
        </div>

        {/* The Player */}
        <div 
          className="absolute w-10 h-10 transition-all duration-100 ease-out z-20"
          style={{ 
            left: player.x * 40, 
            top: player.y * 40 
          }}
        >
          <div className="w-full h-full p-1">
             <div className="w-full h-full bg-red-500 rounded-sm border-2 border-red-700 shadow-lg relative">
                {/* Eyes to show direction */}
                <div className={`absolute w-2 h-2 bg-black top-1 ${player.facing === 'LEFT' ? 'left-0' : 'left-1'}`} />
                <div className={`absolute w-2 h-2 bg-black top-1 ${player.facing === 'RIGHT' ? 'right-0' : 'right-1'}`} />
             </div>
          </div>
        </div>

        {/* Lighting Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none transition-colors duration-[2000ms] z-30 mix-blend-multiply bg-blue-900"
          style={{ opacity: getAmbientLight() }}
        />
      </div>

      {/* UI Layers */}
      <HUD 
        time={time} 
        inventory={inventory} 
        selectedIndex={player.selectedHotbarIndex} 
        onToggleMenu={() => setIsMenuOpen(true)}
      />

      <MenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        inventory={inventory}
        gameTime={time}
      />
      
    </div>
  );
};

export default App;