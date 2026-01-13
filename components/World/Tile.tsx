import React from 'react';
import { TileData, TileType, CropState, ToolType } from '../../types';
import { Sprout, Circle, Ban } from 'lucide-react';

interface TileProps {
  data: TileData;
  isTargeted: boolean;
}

const Tile: React.FC<TileProps> = React.memo(({ data, isTargeted }) => {
  // Determine background based on state
  let bgClass = 'bg-green-600'; // Grass default

  if (data.type === TileType.WATER) bgClass = 'bg-blue-500';
  if (data.type === TileType.ROCK) bgClass = 'bg-stone-600';
  if (data.type === TileType.SOIL) {
    bgClass = data.isWatered ? 'bg-amber-900' : 'bg-amber-700'; // Darker if wet
  }

  // Render crop
  const renderCrop = () => {
    if (!data.crop || data.crop.state === CropState.NONE) return null;

    let color = 'text-green-300';
    let Icon = Sprout;

    if (data.crop.type === ToolType.SEED_CORN) color = 'text-yellow-300';
    if (data.crop.type === ToolType.SEED_TURNIP) color = 'text-purple-300';

    if (data.crop.state === CropState.SEED) return <Circle className="w-2 h-2 text-stone-300" />;
    if (data.crop.state === CropState.MATURE) return <div className={`w-4 h-4 rounded-full ${color.replace('text', 'bg')} border border-white animate-bounce`} />;
    if (data.crop.state === CropState.DEAD) return <Ban className="w-4 h-4 text-stone-800" />;

    return <Icon className={`w-4 h-4 ${color}`} />;
  };

  return (
    <div 
      className={`
        w-full h-full relative flex items-center justify-center
        ${bgClass}
        ${isTargeted ? 'ring-2 ring-white ring-inset z-10' : 'border border-black/10'}
      `}
    >
      {/* Tilled soil texture overlay if needed, using generic CSS for now */}
      {data.isTilled && !data.crop && <div className="w-2 h-2 bg-black/10 rounded-full" />}
      
      {renderCrop()}
    </div>
  );
});

export default Tile;