import React from 'react';
import { ProveniqLogo } from '../onboarding/ProveniqLogo';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex justify-center">
             <ProveniqLogo size={64} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
