import React, { useState } from 'react';
import { PackingPlan, GroupingSuggestion } from '@/lib/types';
import { Lightbulb, ArrowDown, ArrowUp, Package, Trash2, Sparkles, X } from 'lucide-react';

interface PackingPlanModalProps {
  plan: PackingPlan;
  onClose: () => void;
  onCreateBox: (group: GroupingSuggestion) => void;
}

type Tab = 'priority' | 'declutter' | 'groups';

const PackingPlanModal: React.FC<PackingPlanModalProps> = ({ plan, onClose, onCreateBox }) => {
  const [activeTab, setActiveTab] = useState<Tab>('groups');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'priority':
        const packFirst = plan.priority?.filter(p => p.priority === 'Pack First') || [];
        const packLast = plan.priority?.filter(p => p.priority === 'Pack Last') || [];
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><ArrowDown size={16} className="text-blue-500" /> Pack First (Non-Essentials)</h4>
              <div className="space-y-2">
                {packFirst.length > 0 ? packFirst.map((item, i) => <div key={i} className="p-2 bg-gray-50 rounded-md border text-sm"><p className="font-medium">{item.itemName}</p><p className="text-xs text-gray-500">{item.reasoning}</p></div>) : <p className="text-sm text-gray-400 italic">No suggestions.</p>}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><ArrowUp size={16} className="text-green-500" /> Pack Last (Essentials)</h4>
              <div className="space-y-2">
                {packLast.length > 0 ? packLast.map((item, i) => <div key={i} className="p-2 bg-gray-50 rounded-md border text-sm"><p className="font-medium">{item.itemName}</p><p className="text-xs text-gray-500">{item.reasoning}</p></div>) : <p className="text-sm text-gray-400 italic">No suggestions.</p>}
              </div>
            </div>
          </div>
        );
      case 'declutter':
        return (
          <div className="space-y-3">
            {(plan.declutter ?? []).length > 0 ? (plan.declutter ?? []).map((item, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900">{item.itemName}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ 
                    item.action === 'Sell' ? 'bg-green-100 text-green-800' :
                    item.action === 'Donate' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>{item.action}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.reasoning}</p>
              </div>
            )) : <p className="text-sm text-gray-400 italic text-center py-4">No items suggested for decluttering.</p>}
          </div>
        );
      case 'groups':
        return (
            <div className="space-y-3">
                {(plan.groups ?? []).length > 0 ? (plan.groups ?? []).map((group, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900">{group.groupName}</h4>
                        <p className="text-xs text-gray-500 italic mb-2">{group.reasoning}</p>
                        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mb-3">
                           {group.itemNames.map((name, idx) => <li key={idx}>{name}</li>)}
                        </ul>
                        <button onClick={() => onCreateBox(group)} className="w-full py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700">
                           Create this Box
                        </button>
                    </div>
                )) : <p className="text-sm text-gray-400 italic text-center py-4">No grouping suggestions available.</p>}
            </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><Sparkles size={20} /></div>
            <h3 className="text-lg font-bold text-gray-900">AI Packing Plan</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </header>

        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setActiveTab('groups')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'groups' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Package size={16}/> Grouping</button>
            <button onClick={() => setActiveTab('priority')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'priority' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Lightbulb size={16}/> Priority</button>
            <button onClick={() => setActiveTab('declutter')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'declutter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}><Trash2 size={16}/> Declutter</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PackingPlanModal;
