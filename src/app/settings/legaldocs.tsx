
import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, Scale } from 'lucide-react';

interface LegalProps {
  onBack: () => void;
}

const LegalLayout: React.FC<{ title: string; icon: React.ReactNode; onBack: () => void; children: React.ReactNode }> = ({ title, icon, onBack, children }) => (
  <div className="bg-white min-h-full p-6 md:p-12 animate-fade-in">
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={20} /> Back
      </button>
      
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          {icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  </div>
);

export const TermsOfService: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="Terms of Service" icon={<FileText size={32}/>} onBack={onBack}>
    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
    
    <h3>1. Acceptance of Terms</h3>
    <p>By accessing and using the MyARK application ("App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</p>

    <h3>2. Description of Service</h3>
    <p>MyARK provides a home inventory management system that utilizes artificial intelligence to help users catalog, track, and value their personal property.</p>

    <h3>3. User Accounts</h3>
    <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

    <h3>4. AI Services</h3>
    <p>The App uses Google Gemini API for image recognition and data processing. While we strive for accuracy, the App makes no guarantees regarding the accuracy of AI-generated descriptions, values, or identifications. Users should verify all auto-generated information.</p>

    <h3>5. Limitation of Liability</h3>
    <p>MyARK is provided "AS IS" and "AS AVAILABLE" basis. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data or data corruption.</p>
  </LegalLayout>
);

export const PrivacyPolicy: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="Privacy Policy" icon={<ShieldCheck size={32}/>} onBack={onBack}>
    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

    <h3>1. Information We Collect</h3>
    <p>We collect information you provide directly to us, including:</p>
    <ul className="list-disc pl-5">
      <li>Account information (Name, Email)</li>
      <li>Inventory Data (Images, Item Descriptions, Receipts)</li>
      <li>Usage data and device information</li>
    </ul>

    <h3>2. How We Use Your Information</h3>
    <p>We use the collected information to:</p>
    <ul className="list-disc pl-5">
      <li>Provide, maintain, and improve the App</li>
      <li>Process image analysis requests via third-party AI providers</li>
      <li>Generate warranty alerts and reports</li>
    </ul>

    <h3>3. Data Storage</h3>
    <p>Your inventory data is primarily stored locally on your device using browser LocalStorage. We do not maintain a central cloud database of your personal inventory items unless explicitly stated otherwise in future updates.</p>

    <h3>4. Third-Party Services</h3>
    <p>We use Google Gemini API for image processing. Images sent for analysis are processed according to Google's Privacy Policy and are not used by MyARK to train our own models.</p>
  </LegalLayout>
);

export const EULA: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="End User License Agreement" icon={<Scale size={32}/>} onBack={onBack}>
    <p>This End User License Agreement ("Agreement") is between you and MyARK App and governs use of this app made available through the web or app stores.</p>

    <h3>1. License Grant</h3>
    <p>MyArk grants you a limited, non-exclusive, non-transferable, revocable license to use the App for your personal, non-commercial purposes in accordance with this Agreement.</p>

    <h3>2. Restrictions</h3>
    <p>You may not:</p>
    <ul className="list-disc pl-5">
      <li>Reverse engineer, decompile, or disassemble the App</li>
      <li>Use the App for any illegal or unauthorized purpose</li>
      <li>Exploit the App in any unauthorized way whatsoever</li>
    </ul>

    <h3>3. Termination</h3>
    <p>This license is effective until terminated. Your rights under this license will terminate automatically without notice if you fail to comply with any term(s) of this Agreement.</p>

    <h3>4. Disclaimer of Warranties</h3>
    <p>YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT USE OF THE APP IS AT YOUR SOLE RISK. THE APPLICATION IS PROVIDED "AS IS", WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND.</p>
  </LegalLayout>
);
