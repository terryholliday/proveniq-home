import React, { useState, useEffect } from 'react';
import { LegalDocument } from '@/lib/types';
import { X, Scale, Camera, Loader2, Edit3, CheckCircle, ShieldCheck } from 'lucide-react';

interface RemoteNotaryModalProps {
  document: LegalDocument;
  onClose: () => void;
  onComplete: (doc: LegalDocument) => void;
}

type NotaryStep = 'intro' | 'id' | 'signing' | 'sealing' | 'success';

const RemoteNotaryModal: React.FC<RemoteNotaryModalProps> = ({ document, onClose, onComplete }) => {
  const [step, setStep] = useState<NotaryStep>('intro');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if (step === 'id' && isVerifying) {
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setStep('signing');
      }, 2500);
      return () => clearTimeout(timer);
    }
    if (step === 'sealing') {
      setIsSealing(true);
      const timer = setTimeout(() => {
        setIsSealing(false);
        setStep('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, isVerifying]);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImage(reader.result as string);
        setIsVerifying(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSign = () => {
    // In a real app, this would use a signature pad library. We'll simulate.
    setSignature('John Doe'); // Placeholder signature
  };
  
  const handleComplete = () => {
      onComplete({ ...document, status: 'notarized' });
  };

  const renderContent = () => {
    switch(step) {
      case 'id':
        return (
          <div className="text-center p-8">
            <Camera size={40} className="text-indigo-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg">Step 1: Identity Verification</h3>
            <p className="text-sm text-gray-500 mt-2 mb-6">Please upload a photo of your government-issued ID to begin the session.</p>
            {isVerifying ? (
                <div className="flex flex-col items-center">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="mt-2 text-sm text-gray-600">Verifying ID with notary...</p>
                </div>
            ) : idImage ? (
                <img src={idImage} className="w-48 h-auto mx-auto rounded-lg border shadow-sm" alt="ID Preview"/>
            ) : (
                <input type="file" onChange={handleIdUpload} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            )}
          </div>
        );
      case 'signing':
        return (
           <div className="p-8 space-y-4">
            <h3 className="font-bold text-lg text-center">Step 2: Live Session & Signature</h3>
            <div className="relative w-full aspect-video bg-gray-800 rounded-lg text-white flex items-center justify-center">
                <p className="text-sm">Simulated Live Notary Session...</p>
                 <div className="absolute top-2 right-2 w-24 h-16 bg-gray-700 rounded border-2 border-gray-600 text-xs flex items-center justify-center">Your Video</div>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                {signature ? (
                    <p className="font-serif text-2xl text-gray-800 italic">{signature}</p>
                ) : (
                    <p className="text-gray-400">Signature Pad</p>
                )}
            </div>
            {!signature ? (
                <button onClick={handleSign} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-lg">
                    <Edit3 size={16}/> Apply Your Digital Signature
                </button>
            ) : (
                 <button onClick={() => setStep('sealing')} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-bold rounded-lg">
                    Finalize & Submit
                </button>
            )}
           </div>
        );
       case 'sealing':
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center min-h-[24rem]">
              <div className="relative w-32 h-32">
                  <ShieldCheck size={128} className="text-green-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{animationDuration: '3s', animationTimingFunction: 'linear' }}>
                      <circle cx="50" cy="50" r="45" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="3" fill="none" strokeDasharray="10 5" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Scale size={48} className="text-green-600"/>
                  </div>
              </div>
            <h3 className="font-bold text-lg mt-4">Applying Digital Notary Seal...</h3>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        );
      case 'success':
        return (
           <div className="text-center p-8">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Document Notarized!</h3>
            <p className="text-gray-600 mt-2 max-w-sm mx-auto">Your document has been digitally signed and sealed. It is now saved in your Legacy Vault with 'Notarized' status.</p>
            <button onClick={handleComplete} className="w-full mt-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Done</button>
          </div>
        );
      case 'intro':
      default:
        return (
          <div className="text-center p-8">
            <Scale size={48} className="text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Remote Online Notarization</h3>
            <p className="text-gray-600 mt-2 max-w-sm mx-auto">This simulates connecting with a certified remote notary to legally execute your document. You will need a valid photo ID.</p>
            <button onClick={() => setStep('id')} className="w-full mt-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Start Notary Session</button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Notarize: {document.name}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </header>
        <div className="flex-1">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RemoteNotaryModal;
