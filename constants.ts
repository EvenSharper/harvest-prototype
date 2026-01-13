import { InventoryItem, ToolType } from "./types";
import { Pickaxe, Shovel, Droplets, Cherry, Wheat } from "lucide-react"; // Just for type ref, actual usage handles icons dynamically

export const WORLD_WIDTH = 20;
export const WORLD_HEIGHT = 15;

export const TICK_RATE_MS = 100; // Game loop speed
export const MS_PER_GAME_MINUTE = 100; // How fast time flies
export const DAY_START_HOUR = 6;
export const NIGHT_START_HOUR = 18;

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', type: ToolType.HOE, name: 'Rusty Hoe', count: -1, icon: 'HOE' },
  { id: '2', type: ToolType.WATERING_CAN, name: 'Watering Can', count: -1, icon: 'WATER' },
  { id: '3', type: ToolType.SEED_TURNIP, name: 'Turnip Seeds', count: 5, icon: 'SEED' },
  { id: '4', type: ToolType.SEED_CORN, name: 'Corn Seeds', count: 5, icon: 'SEED' },
  { id: '5', type: ToolType.HAND, name: 'Hand', count: -1, icon: 'HAND' },
];

export const CROP_GROWTH_TIME = {
  [ToolType.SEED_TURNIP]: 2, // Days to mature
  [ToolType.SEED_CORN]: 4,
};