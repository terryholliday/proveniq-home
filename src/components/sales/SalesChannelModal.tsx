import React, { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { X, Gavel, ShoppingBag, Copy, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { generateBundleAd } from '@/services/backendService';

interface SalesChannelModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onStartAuction: () => void; // Trigger the existing auction flow
}

const SalesChannelModal: React.FC<SalesChannelModalProps> = ({ items, onClose, onStartAuction }) => {
  const [step, setStep] = useState<'select' | 'generate'>('select');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [adCopy, setAdCopy] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const platforms = [
      { id: 'Facebook Marketplace', icon: <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">f</div>, color: 'hover:border-blue-500 hover:bg-blue-50' },
      { id: 'eBay', icon: <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-800 font-bold text-lg"><span className="text-red-500">e</span><span className="text-blue-500">b</span><span className="text-yellow-500">a</span><span className="text-green-500">y</span></div>, color: 'hover:border-blue-400 hover:bg-gray-50' },
      { id: 'OfferUp', icon: <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">O</div>, color: 'hover:border-green-500 hover:bg-green-50' },
      { id: 'Craigslist', icon: <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl">C</div>, color: 'hover:border-purple-500 hover:bg-purple-50' }
  ];

  const handlePlatformSelect = async (platformId: string) => {
      setSelectedPlatform(platformId);
      setStep('generate');
      setIsGenerating(true);
      try {
          const result = await generateBundleAd(items, platformId);
          setAdCopy(result.adCopy);
          setSuggestedPrice(result.suggestedPrice);
      } catch {
          setAdCopy("Failed to generate ad copy. Please try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(adCopy);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <header className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-indigo-600"/>
                <h3 className="font-bold text-gray-900">Sales Hub</h3>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
                <X size={20}/>
            </button>
        </header>

        <div className="p-6">
            {step === 'select' ? (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">How would you like to sell these {items.length} items?</h2>
                        <p className="text-gray-500 text-sm">Choose a channel below.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Option 1: Auction */}
                        <button 
                            onClick={onStartAuction}
                            className="flex items-center gap-4 p-4 border-2 border-indigo-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                        >
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Gavel size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">PROVENIQ Bids</h4>
                                <p className="text-sm text-gray-500">Create a private online auction page to share with buyers.</p>
                            </div>
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">OR Post Externally</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* Option 2: External Marketplaces Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {platforms.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => handlePlatformSelect(p.id)}
                                    className={`flex items-center gap-3 p-3 border border-gray-200 rounded-xl transition-all ${p.color}`}
                                >
                                    {p.icon}
                                    <span className="font-bold text-gray-700 text-sm">{p.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => setStep('select')} className="text-sm text-gray-400 hover:text-gray-600">Back</button>
                        <span className="text-gray-300">/</span>
                        <span className="font-bold text-gray-800">{selectedPlatform} Listing</span>
                     </div>
                     
                     {isGenerating ? (
                         <div className="py-12 text-center">
                             <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-4"/>
                             <p className="font-bold text-gray-800">Writing your sales pitch...</p>
                         </div>
                     ) : (
                         <>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-indigo-600 uppercase">Suggested Bundle Price</p>
                                    <p className="text-2xl font-bold text-indigo-900">${suggestedPrice}</p>
                                </div>
                                <Sparkles className="text-indigo-400"/>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Generated Ad Copy</label>
                                <div className="relative">
                                    <textarea 
                                        value={adCopy} 
                                        readOnly 
                                        className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm leading-relaxed focus:outline-none resize-none"
                                    />
                                    <button 
                                        onClick={copyToClipboard}
                                        className="absolute top-2 right-2 p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                                        title="Copy to Clipboard"
                                    >
                                        {isCopying ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex gap-3 items-start">
                                <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5"/>
                                <p className="text-xs text-yellow-800">
                                    Copy this text and paste it into a new listing on {selectedPlatform}. Don&apos;t forget to attach your photos!
                                </p>
                            </div>
                         </>
                     )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SalesChannelModal;
