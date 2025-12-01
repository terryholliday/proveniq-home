import React from 'react';
import { Camera, Shield, Check, ArrowRight, Mic } from 'lucide-react';
import { MyArkLogo } from './onboarding/MyArkLogo';

interface PermissionRequestProps {
  onComplete: () => void;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({ onComplete }) => {

  const handleAllow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true
      });
      // Stop the tracks immediately to turn off camera/mic light
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Permission request failed:", error);
      // We still complete the flow even if it fails
    } finally {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mx-auto mb-6 flex justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
                <MyArkLogo />
            </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enable Your Camera & Microphone</h2>
        <p className="text-gray-500 mb-6">
          MyARK uses your camera and microphone for features like remote notary services and video confirmation for high-value transactions.
        </p>

        <div className="space-y-4">
          <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 mr-4">
                <Camera size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-gray-800">Camera Access</h3>
                <p className="text-sm text-gray-500">For identity verification and recording item condition.</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 mr-4">
                <Mic size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-gray-800">Microphone Access</h3>
                <p className="text-sm text-gray-500">For verbal confirmations and communication during notary sessions.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
            <button 
                onClick={handleAllow}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all duration-300"
            >
                <Check size={18} />
                Allow Access
            </button>
            <button 
                onClick={handleSkip}
                className="w-full mt-2 py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
                Skip For Now
            </button>
        </div>

        <div className="mt-6 text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <Shield size={12} /> Your privacy is important to us.
        </div>
      </div>
    </div>
  );
};

export default PermissionRequest;
