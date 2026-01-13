import React from 'react';
import { GameTime, InventoryItem, ToolType } from '../../types';
import { Hammer, Droplets, Sprout, Hand, Menu as MenuIcon } from 'lucide-react';

interface HUDProps {
  time: GameTime;
  inventory: InventoryItem[];
  selectedIndex: number;
  onToggleMenu: () => void;
}

const HUD: React.FC<HUDProps> = ({ time, inventory, selectedIndex, onToggleMenu }) => {
  const getIcon = (type: ToolType) => {
    switch (type) {
      case ToolType.HOE: return <Hammer size={20} />;
      case ToolType.WATERING_CAN: return <Droplets size={20} />;
      case ToolType.HAND: return <Hand size={20} />;
      default: return <Sprout size={20} />;
    }
  };

  // Format time
  const timeString = `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  const dayString = `Day ${time.day}`;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-50">
      {/* Top Bar: Time and Menu */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-slate-800/80 border-2 border-slate-600 p-3 rounded-lg text-amber-100 shadow-xl backdrop-blur-sm">
          <div className="text-xl font-bold tracking-widest">{timeString}</div>
          <div className="text-xs uppercase text-slate-400 font-semibold">{dayString}</div>
        </div>

        <button 
          onClick={onToggleMenu}
          className="bg-slate-800/80 hover:bg-slate-700 border-2 border-slate-600 p-2 rounded-lg text-white transition-colors"
        >
          <MenuIcon size={24} />
        </button>
      </div>

      {/* Bottom Bar: Hotbar */}
      <div className="flex justify-center pointer-events-auto">
        <div className="bg-slate-800/90 p-2 rounded-xl flex gap-2 border-4 border-slate-700 shadow-2xl">
          {inventory.slice(0, 5).map((item, index) => (
            <div
              key={item.id}
              className={`
                relative w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-100
                ${index === selectedIndex ? 'bg-amber-600 -translate-y-2 ring-2 ring-white' : 'bg-slate-700 opacity-80'}
              `}
            >
              <div className="text-white">
                {getIcon(item.type)}
              </div>
              <span className="absolute top-1 left-1 text-[10px] text-slate-300 font-mono">{index + 1}</span>
              {item.count > -1 && (
                <span className="absolute bottom-1 right-1 text-xs font-bold text-white shadow-black drop-shadow-md">
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HUD;