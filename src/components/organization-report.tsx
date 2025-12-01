import React, { useState } from 'react';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { OrganizationSuggestion } from '@/lib/types';

// Mock data for visualization if AI service isn't connected yet
const mockSuggestions: OrganizationSuggestion[] = [
    {
        itemId: '1',
        itemName: 'Winter Coat',
        currentLocation: 'Living Room',
        suggestedLocation: 'Hall Closet',
        reasoning: 'Seasonal clothing is best stored out of daily living spaces.'
    },
    {
        itemId: '2',
        itemName: 'Drill Bit Set',
        currentLocation: 'Kitchen Drawer',
        suggestedLocation: 'Garage',
        reasoning: 'Tools should be consolidated in a workshop area for safety.'
    }
];

const OrganizationReport: React.FC = () => {
  const [suggestions, setSuggestions] = useState<OrganizationSuggestion[]>(mockSuggestions); 
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const handleAccept = (id: string) => {
      const newSet = new Set(accepted);
      newSet.add(id);
      setAccepted(newSet);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Lightbulb size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organization Report</h2>
          <p className="text-gray-500 text-sm">AI-driven suggestions to optimize your space.</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-4">
        {suggestions.map((s, i) => (
            <div key={i} className={`border rounded-xl p-4 transition-all ${accepted.has(s.itemId) ? 'bg-green-50 border-green-200 opacity-50' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-bold text-lg text-gray-800">{s.itemName}</h4>
                        <p className="text-sm text-gray-500 italic">{s.reasoning}</p>
                    </div>
                    {!accepted.has(s.itemId) && (
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-red-500 border rounded-lg hover:bg-red-50"><X size={20}/></button>
                            <button onClick={() => handleAccept(s.itemId)} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"><Check size={20}/></button>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                    <div className="bg-gray-100 px-3 py-1 rounded text-gray-600 font-medium">{s.currentLocation}</div>
                    <ArrowRight size={16} className="text-indigo-400" />
                    <div className="bg-indigo-100 px-3 py-1 rounded text-indigo-700 font-bold">{s.suggestedLocation}</div>
                </div>
            </div>
        ))}
        
        {suggestions.length === 0 && (
            <div className="text-center text-gray-400 py-12">
                <p>Your inventory is perfectly organized!</p>
            </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Apply Changes</button>
      </div>
    </div>
  );
};

export default OrganizationReport;
