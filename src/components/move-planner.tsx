
import React, { useState, useEffect } from 'react';
import { Truck, Plus, ArrowRight, Calendar } from 'lucide-react';
import { Move, Box, InventoryItem } from '@/lib/types';
import { mockInventory } from '@/lib/data';

// Mock data and functions since storageService doesn't exist
const getMoves = (): Move[] => {
  // In a real app, this would fetch from a database or local storage
  return [
    { id: 'move-1', name: 'New Apartment', date: '2024-08-15' },
    { id: 'move-2', name: 'Move to Storage', date: '2024-09-01' },
  ];
};

const addMove = (name: string, date: string): Move => {
  const newMove: Move = {
    id: `move-${Date.now()}`,
    name,
    date,
  };
  // In a real app, this would save to a database or local storage
  console.log('Added move:', newMove);
  return newMove;
};

const getBoxes = (): Box[] => {
  // In a real app, this would fetch from a database or local storage
  return [
    { id: 'box-1', name: 'Kitchen Stuff', moveId: 'move-1' },
    { id: 'box-2', name: 'Books', moveId: 'move-1' },
    { id: 'box-3', name: 'Winter Clothes', moveId: 'move-2' },
  ];
};

const getItems = (): InventoryItem[] => {
  // Using the mock inventory from data.ts
  return mockInventory;
};


interface MovePlannerProps {
  onSelectMove: (move: Move) => void;
}

const MovePlanner: React.FC<MovePlannerProps> = ({ onSelectMove }) => {
  const [moves, setMoves] = useState<Move[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newMoveName, setNewMoveName] = useState('');
  const [newMoveDate, setNewMoveDate] = useState('');

  const refreshData = () => {
    setMoves(getMoves());
    setBoxes(getBoxes());
    setItems(getItems());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddMove = () => {
    if (newMoveName && newMoveDate) {
      addMove(newMoveName, newMoveDate);
      refreshData();
      setNewMoveName('');
      setNewMoveDate('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3 shrink-0">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Truck size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Move Planner</h2>
          <p className="text-gray-500 text-sm">Organize your boxes and track your move.</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3">Schedule a New Move</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Move Name (e.g. New Apartment)" 
              className="p-3 border border-gray-300 rounded-lg flex-1 bg-white text-gray-900"
              value={newMoveName}
              onChange={(e) => setNewMoveName(e.target.value)}
            />
            <input 
              type="date" 
              className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              value={newMoveDate}
              onChange={(e) => setNewMoveDate(e.target.value)}
            />
            <button 
              onClick={handleAddMove}
              disabled={!newMoveName || !newMoveDate}
              className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Create
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-3 text-lg">Your Moves</h3>
          {moves.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <Truck size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400">No moves planned yet.</p>
              <p className="text-xs text-gray-400">Schedule one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moves.map(move => {
                const boxesInMove = boxes.filter(b => b.moveId === move.id);
                return (
                  <button 
                    key={move.id} 
                    onClick={() => onSelectMove(move)}
                    className="w-full text-left bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group"
                  >
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{move.name}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1 gap-2">
                        <Calendar size={14} />
                        <span>{new Date(move.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-4 mt-3">
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">{items.filter(i => !i.boxId).length}</span>
                          <span className="text-gray-500"> items to pack</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">{boxesInMove.length}</span>
                          <span className="text-gray-500"> boxes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Manage</span>
                      <ArrowRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovePlanner;
