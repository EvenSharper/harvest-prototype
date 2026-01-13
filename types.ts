export enum ToolType {
  HAND = 'HAND',
  HOE = 'HOE',
  WATERING_CAN = 'WATERING_CAN',
  SEED_TURNIP = 'SEED_TURNIP',
  SEED_CORN = 'SEED_CORN',
}

export enum TileType {
  GRASS = 'GRASS',
  SOIL = 'SOIL',
  WATER = 'WATER',
  ROCK = 'ROCK',
}

export enum CropState {
  NONE = 'NONE',
  SEED = 'SEED',
  SPROUT = 'SPROUT',
  GROWING = 'GROWING',
  MATURE = 'MATURE',
  DEAD = 'DEAD',
}

export interface InventoryItem {
  id: string;
  type: ToolType;
  name: string;
  count: number; // -1 for infinite (tools)
  icon: string;
}

export interface Crop {
  type: ToolType; // The seed type used
  state: CropState;
  daysPlanted: number;
  daysWatered: number;
}

export interface TileData {
  x: number;
  y: number;
  type: TileType;
  isTilled: boolean;
  isWatered: boolean;
  crop: Crop | null;
  collidable: boolean;
}

export interface Player {
  x: number; // Grid coordinates
  y: number;
  facing: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  selectedHotbarIndex: number;
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
}