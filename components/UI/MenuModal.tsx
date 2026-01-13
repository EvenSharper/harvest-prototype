import React, { useState } from 'react';
import { GameTime, InventoryItem } from '../../types';
import { askAlmanac } from '../../services/geminiService';
import { X, BookOpen, Settings, Backpack, Loader2 } from 'lucide-react';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  gameTime: GameTime;
}

type Tab = 'INVENTORY' | 'ALMANAC' | 'SETTINGS';

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, inventory, gameTime }) => {
  const [activeTab, setActiveTab] = useState<Tab>('INVENTORY');
  const [almanacQuery, setAlmanacQuery] = useState('');
  const [almanacResponse, setAlmanacResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAskAlmanac = async () => {
    if (!almanacQuery.trim()) return;
    setLoading(true);
    setAlmanacResponse(null);
    const response = await askAlmanac(almanacQuery, "Spring", gameTime.day);
    setAlmanacResponse(response);
    setLoading(false);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 w-full max-w-2xl h-[500px] rounded-xl border-4 border-slate-600 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-700 p-4 flex justify-between items-center border-b-2 border-slate-600">
          <h2 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
            {activeTab === 'INVENTORY' && <><Backpack /> Rucksack</>}
            {activeTab === 'ALMANAC' && <><BookOpen /> The Almanac</>}
            {activeTab === 'SETTINGS' && <><Settings /> Settings</>}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={32} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex-1 p-3 font-bold transition-colors ${activeTab === 'INVENTORY' ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('ALMANAC')}
            className={`flex-1 p-3 font-bold transition-colors ${activeTab === 'ALMANAC' ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            AI Almanac
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 p-3 font-bold transition-colors ${activeTab === 'SETTINGS' ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            System
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-800">
          
          {activeTab === 'INVENTORY' && (
            <div className="grid grid-cols-4 gap-4">
              {inventory.map((item, i) => (
                <div key={i} className="bg-slate-700 p-4 rounded-lg border-2 border-slate-600 flex flex-col items-center gap-2 hover:border-amber-500 transition-colors">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-2xl">
                    {/* Placeholder for real icons */}
                    <span className="text-xs">{item.icon}</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm text-white">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.count === -1 ? 'Tool' : `x${item.count}`}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ALMANAC' && (
            <div className="flex flex-col h-full gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg flex-1 overflow-y-auto border border-slate-700">
                {!almanacResponse && !loading && (
                  <div className="text-slate-500 italic text-center mt-10">
                    "Ask the spirits about farming tips, crops, or the weather..."
                  </div>
                )}
                {loading && (
                  <div className="flex items-center justify-center h-full text-amber-500">
                    <Loader2 className="animate-spin w-8 h-8" />
                  </div>
                )}
                {almanacResponse && (
                  <div className="prose prose-invert prose-sm">
                   {almanacResponse.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={almanacQuery}
                  onChange={(e) => setAlmanacQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAlmanac()}
                  placeholder="Ask the Almanac..." 
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                />
                <button 
                  onClick={handleAskAlmanac}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Consult
                </button>
              </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
             <div className="flex flex-col gap-4 text-center text-slate-400">
               <p>Controls:</p>
               <ul className="list-disc list-inside">
                 <li>WASD / Arrows to Move</li>
                 <li>SPACE to Interact/Farm</li>
                 <li>1-5 to select tools</li>
                 <li>M to open Menu</li>
               </ul>
               <div className="mt-8 p-4 border border-red-900/50 bg-red-900/20 rounded text-red-300">
                 Reset Game Data (Not Implemented)
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuModal;