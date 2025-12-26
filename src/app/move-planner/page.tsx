'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { Move, InventoryItem, Box, PackingPlan, GroupingSuggestion } from '@/lib/types';
import { getBoxes, saveBox, deleteBox, updateItem } from '@/lib/data';
import { generatePackingPlan } from '@/lib/backend';
import { ArrowLeft, Plus, Printer, Trash2, Loader2, Sparkles, Check, Crown, Box as BoxIcon } from 'lucide-react';
import PrintableBoxLabel from '@/components/printableboxlabel';
import { checkPermission, PERMISSIONS } from '@/lib/subscription-service';

const PackingPlanModal = ({ plan, onClose, onCreateBox }: { plan: PackingPlan, onClose: () => void, onCreateBox: (group: GroupingSuggestion) => void }) => {
  return null;
};

interface MoveDetailProps {
  move: Move;
  items: InventoryItem[];
  onBack: () => void;
  onUpdateItems: () => void;
  onPrintLabel: (box: Box, items: InventoryItem[]) => void;
  onUpgradeReq: (feature: string) => void;
  isLandscape: boolean;
}

const MoveDetail = ({ move, items, onBack, onUpdateItems, onPrintLabel, onUpgradeReq, isLandscape }: MoveDetailProps) => {
  const { user } = useUser();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [showAddBox, setShowAddBox] = useState(false);
  const [newBoxName, setNewBoxName] = useState('');
  const [newBoxRoom, setNewBoxRoom] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // AI State
  const [packingPlan, setPackingPlan] = useState<PackingPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const unpackedItems = useMemo(() => items.filter(item => !item.boxId), [items]);

  const refreshBoxes = useCallback(() => setBoxes(getBoxes(move.id)), [move.id]);

  useEffect(() => {
    refreshBoxes();
  }, [refreshBoxes]);

  const handleAddBox = () => {
    if (!newBoxName.trim()) return;
    saveBox({ name: newBoxName.trim(), moveId: move.id, destinationRoom: newBoxRoom.trim() || undefined });
    refreshBoxes();
    setNewBoxName('');
    setNewBoxRoom('');
    setShowAddBox(false);
  };

  const handleDeleteBox = (boxId: string) => {
    if (window.confirm("Delete this box? All items inside will be marked as unpacked.")) {
      deleteBox(boxId);
      refreshBoxes();
      onUpdateItems();
    }
  };

  const handleItemSelection = (itemId: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(itemId)) newSet.delete(itemId);
    else newSet.add(itemId);
    setSelectedItemIds(newSet);
  };

  const assignSelectedToBox = (boxId: string) => {
    if (selectedItemIds.size === 0) return;
    selectedItemIds.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) updateItem({ ...item, boxId });
    });
    setSelectedItemIds(new Set());
    onUpdateItems();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, boxId: string) => {
    e.preventDefault();
    if (draggedItemId) {
      const item = items.find(i => i.id === draggedItemId);
      if (item) {
        updateItem({ ...item, boxId });
        onUpdateItems();
      }
      setDraggedItemId(null);
    }
    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
  };

  const handleGeneratePlan = async () => {
    // Cast user to any to bypass type mismatch between Firebase User and Domain User for now
    if (!checkPermission(user as { tier?: string }, PERMISSIONS.MOVE_AI)) {
      onUpgradeReq('AI Move Planning');
      return;
    }

    setIsGeneratingPlan(true);
    setPackingPlan(null);
    const plan = await generatePackingPlan(unpackedItems);
    setPackingPlan(plan);
    setIsGeneratingPlan(false);
  };

  const createBoxFromSuggestion = (group: GroupingSuggestion) => {
    const box = saveBox({ name: group.name, moveId: move.id });
    group.itemIds.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) updateItem({ ...item, boxId: box.id });
    });
    refreshBoxes();
    onUpdateItems();
    setPackingPlan(null); // Close modal after action
  };

  return (
    <div className="bg-white rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
      {isGeneratingPlan && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <Loader2 size={40} className="text-white animate-spin mb-4" />
          <p className="text-white font-bold text-lg">Generating Your AI Packing Plan...</p>
          <p className="text-indigo-200">This may take a moment.</p>
        </div>
      )}
      {packingPlan && <PackingPlanModal plan={packingPlan} onClose={() => setPackingPlan(null)} onCreateBox={createBoxFromSuggestion} />}

      <header className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{move.name}</h2>
            <p className="text-sm text-gray-500">Move Date: {new Date(move.date).toLocaleDateString()}</p>
          </div>
        </div>
        <button onClick={handleGeneratePlan} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 border border-indigo-100 relative overflow-hidden">
          {!checkPermission(user as { tier?: string }, PERMISSIONS.MOVE_AI) && <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10"><Crown size={14} className="text-amber-500" /></div>}
          <Sparkles size={16} /> Get AI Packing Plan
        </button>
      </header>

      <div className={`flex-1 grid ${isLandscape ? 'grid-cols-2' : 'grid-cols-1'} md:grid-cols-2 overflow-hidden`}>
        {/* Left: Unpacked Items */}
        <div className="flex flex-col border-r border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800">Unpacked Items ({unpackedItems.length})</h3>
            {selectedItemIds.size > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-full">{selectedItemIds.size} selected</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {unpackedItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedItemId(item.id)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors ${selectedItemIds.has(item.id) ? 'bg-indigo-50 border-indigo-300' : 'border-transparent hover:bg-gray-100'}`}
                onClick={() => handleItemSelection(item.id)}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-800 truncate">{item.name}</p><p className="text-xs text-gray-500">{item.location}</p></div>
                {selectedItemIds.has(item.id) && <Check size={16} className="text-indigo-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Boxes */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800">Boxes ({boxes.length})</h3>
            <button onClick={() => setShowAddBox(!showAddBox)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><Plus size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {showAddBox && (
              <div className="p-4 mb-2 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                <input value={newBoxName} onChange={e => setNewBoxName(e.target.value)} placeholder="Box Name (e.g., Kitchen Fragile)" className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <input value={newBoxRoom} onChange={e => setNewBoxRoom(e.target.value)} placeholder="Destination Room (Optional)" className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddBox(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleAddBox} className="flex-1 py-2.5 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">Add Box</button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {boxes.map((box, index) => {
                const itemsInBox = items.filter(i => i.boxId === box.id);
                return (
                  <div key={box.id} onDrop={e => handleDrop(e, box.id)} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="border border-gray-200 rounded-lg transition-colors">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 flex items-center gap-2"><span className="text-xs bg-gray-200 font-mono p-1 rounded">#{index + 1}</span> {box.name}</p>
                        {box.destinationRoom && <p className="text-xs text-gray-500 mt-1">For: {box.destinationRoom}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => onPrintLabel(box, itemsInBox)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"><Printer size={16} /></button>
                        <button onClick={() => handleDeleteBox(box.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {itemsInBox.map(item => (
                        <div key={item.id} className="text-xs text-gray-600 p-1 bg-white rounded flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} width={16} height={16} unoptimized />
                            ) : null}
                          </div>
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                      {selectedItemIds.size > 0 && <button onClick={() => assignSelectedToBox(box.id)} className="w-full text-center text-xs py-2 bg-indigo-50 text-indigo-700 font-bold rounded-md hover:bg-indigo-100">Add {selectedItemIds.size} items here</button>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MovePlannerPage() {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [showPrintLabel, setShowPrintLabel] = useState<{ box: Box; items: InventoryItem[] } | null>(null);

  // Load moves from localStorage on mount
  useEffect(() => {
    const savedMoves = localStorage.getItem('proveniq_moves');
    if (savedMoves) {
      setMoves(JSON.parse(savedMoves));
    }
    // Load mock inventory for now - in production this would come from Firebase
    import('@/lib/data').then(({ mockInventory }) => {
      setAllItems(mockInventory || []);
    });
  }, []);

  // Save moves to localStorage whenever they change
  useEffect(() => {
    if (moves.length > 0) {
      localStorage.setItem('proveniq_moves', JSON.stringify(moves));
    }
  }, [moves]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMoveName, setNewMoveName] = useState('');
  const [newMoveDate, setNewMoveDate] = useState('');
  const [newMoveOrigin, setNewMoveOrigin] = useState('');
  const [newMoveDestination, setNewMoveDestination] = useState('');

  const handleCreateMove = () => {
    if (!newMoveName.trim() || !newMoveDate) return;

    const newMove: Move = {
      id: `move_${Date.now()}`,
      name: newMoveName.trim(),
      date: newMoveDate,
      origin: newMoveOrigin.trim() || undefined,
      destination: newMoveDestination.trim() || undefined,
      status: 'planning'
    };

    setMoves(prev => [...prev, newMove]);
    setNewMoveName('');
    setNewMoveDate('');
    setNewMoveOrigin('');
    setNewMoveDestination('');
    setShowCreateForm(false);
  };

  const handleDeleteMove = (moveId: string) => {
    if (window.confirm('Delete this move and all its boxes?')) {
      setMoves(prev => prev.filter(m => m.id !== moveId));
    }
  };

  const handlePrintLabel = (box: Box, items: InventoryItem[]) => {
    setShowPrintLabel({ box, items });
  };

  const handleUpdateItems = () => {
    // Refresh items from data source
    import('@/lib/data').then(({ mockInventory }) => {
      setAllItems(mockInventory || []);
    });
  };

  if (showPrintLabel) {
    return (
      <PrintableBoxLabel
        box={showPrintLabel.box}
        items={showPrintLabel.items}
        onDone={() => setShowPrintLabel(null)}
      />
    );
  }

  if (selectedMove) {
    return (
      <MoveDetail
        move={selectedMove}
        items={allItems}
        onBack={() => setSelectedMove(null)}
        onUpdateItems={handleUpdateItems}
        onPrintLabel={handlePrintLabel}
        onUpgradeReq={() => {}}
        isLandscape={false}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Move Planner</h1>
          <p className="text-muted-foreground mt-1">Organize your items into boxes for an upcoming move</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} />
          New Move
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Create New Move</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move Name *</label>
              <input
                value={newMoveName}
                onChange={e => setNewMoveName(e.target.value)}
                placeholder="e.g., Spring 2024 Move"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move Date *</label>
              <input
                type="date"
                value={newMoveDate}
                onChange={e => setNewMoveDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin Address</label>
              <input
                value={newMoveOrigin}
                onChange={e => setNewMoveOrigin(e.target.value)}
                placeholder="123 Current Street"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Address</label>
              <input
                value={newMoveDestination}
                onChange={e => setNewMoveDestination(e.target.value)}
                placeholder="456 New Street"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateMove}
              disabled={!newMoveName.trim() || !newMoveDate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Move
            </button>
          </div>
        </div>
      )}

      {moves.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <BoxIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No moves yet</h3>
          <p className="text-gray-500 mb-4">Create a move to start organizing your items into boxes</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
          >
            Create Your First Move
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {moves.map(move => (
            <div
              key={move.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMove(move)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BoxIcon size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{move.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(move.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${move.status === 'completed' ? 'bg-green-100 text-green-700' :
                    move.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                    {move.status === 'in-progress' ? 'In Progress' : move.status === 'completed' ? 'Completed' : 'Planning'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMove(move.id); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {(move.origin || move.destination) && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  {move.origin && <span>From: {move.origin}</span>}
                  {move.origin && move.destination && <span className="mx-2">→</span>}
                  {move.destination && <span>To: {move.destination}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
