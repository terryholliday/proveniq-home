
import React, { useState } from 'react';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

interface SalesTrainingLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const SalesTrainingLogin: React.FC<SalesTrainingLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'TrueARKtech') {
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 animate-fade-in bg-gray-50">
      <div className="max-w-md w-full">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to MyARK
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
            <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-6">
                <ShieldCheck className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Internal Training</h1>
            <p className="text-gray-500 mb-8 text-sm">This portal is restricted to authorized personnel. Please enter your access code.</p>
            
            <form onSubmit={handleLoginAttempt} className="space-y-4">
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Access Code"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-500 text-xs font-medium text-left ml-1">{error}</p>}
                
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-2">
                    Access Portal <ArrowRight size={18} />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SalesTrainingLogin;