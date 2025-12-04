import React from "react";
import { ArrowLeft, ShieldCheck, FileText, Scale, Bot, Cookie } from "lucide-react";

interface LegalProps {
  onBack: () => void;
}

const LegalLayout: React.FC<{
  title: string;
  icon: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}> = ({ title, icon, onBack, children }) => (
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
  <LegalLayout title="Terms of Service" icon={<FileText size={32} />} onBack={onBack}>
    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

    <h3>0. Contract Formation &amp; Manifestation of Assent</h3>
    <p>Your use of the MyARK Service is conditioned on an affirmative act of consent (e.g., checking the agreement box during sign-up or when prompted on re-entry). Passive “browsewrap” or sign-in-wrap without an affirmative checkbox is not used. Returning users will be required to affirmatively agree to materially updated terms upon next login.</p>

    <h3>1. Acceptance of Terms</h3>
    <p>By accessing and using the MyARK application (&quot;App&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</p>

    <h3>2. Description of Service</h3>
    <p>MyARK provides a home inventory management system that utilizes artificial intelligence to help users catalog, track, and value their personal property.</p>

    <h3>3. User Accounts</h3>
    <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

    <h3>4. AI Services</h3>
    <p>The App uses third-party Large Language Models (LLMs) and generative AI providers for image recognition and data processing. While we strive for accuracy, the App makes no guarantees regarding the accuracy of AI-generated descriptions, values, or identifications. Users should verify all auto-generated information. We do not make unsubstantiated accuracy claims; AI outputs may be incomplete or incorrect.</p>

    <h3>5. Limitation of Liability</h3>
    <p>MyARK is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data or data corruption.</p>

    <h3>6. Blockchain &amp; Data Minimization</h3>
    <p>Where blockchain proofs (e.g., TrueManifest / TrueLedger) are used, personal data is stored off-chain; only hashed values with a secret pepper/salt are placed on-chain to avoid personal data immutability conflicts and to support data-subject rights (including erasure requests).</p>
  </LegalLayout>
);

export const PrivacyPolicy: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="Privacy Policy" icon={<ShieldCheck size={32} />} onBack={onBack}>
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
    <p>We use third-party AI providers (as detailed in our AI Services Disclosure) for image processing. Images sent for analysis are processed according to the provider&apos;s Privacy Policy and are not used by MyARK to train our own models unless explicitly consented.</p>
  </LegalLayout>
);

export const EULA: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="End User License Agreement" icon={<Scale size={32} />} onBack={onBack}>
    <p>This End User License Agreement (&quot;Agreement&quot;) is between you and MyARK App and governs use of this app made available through the web or app stores.</p>

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
    <p>YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT USE OF THE APP IS AT YOUR SOLE RISK. THE APPLICATION IS PROVIDED &quot;AS IS&quot;, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND.</p>
  </LegalLayout>
);

export const AIDisclosure: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="AI Services Disclosure & User Consent" icon={<Bot size={32} />} onBack={onBack}>
    <p><strong>MyARK AI Services Disclosure &amp; User Consent Addendum</strong></p>

    <h3>1. Purpose of This Addendum</h3>
    <p>This AI Services Disclosure &amp; User Consent Addendum (&quot;Addendum&quot;) supplements the MyARK Terms of Service and Privacy Policy. It governs the use of artificial intelligence features within the MyARK Service.</p>

    <h3>2. Use of AI in MyARK</h3>
    <p>MyARK utilizes third-party Large Language Models (LLMs) and generative AI providers (collectively, &quot;AI Providers&quot;) to assist with image analysis, metadata extraction, item descriptions, indicative valuations, and categorization. A current list of AI sub-processors is available upon request.</p>

    <h3>3. Data Transmission to AI Providers</h3>
    <p>To facilitate these features, the following data may be transmitted to AI Providers: item photographs, text descriptions, and metadata (brand, model, serial numbers).</p>

    <h3>4. No Training Use Unless Explicitly Consented</h3>
    <p>MyARK does not authorize AI Providers to use your data for training their foundational models unless you explicitly opt-in or as otherwise permitted by applicable law.</p>

    <h3>5. AI OUTPUT LIMITATIONS &amp; DISCLAIMER OF WARRANTIES</h3>
    <p><strong>THE AI SERVICES ARE PROVIDED &quot;AS IS&quot; AND WITH ALL FAULTS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, MYARK DISCLAIMS ALL WARRANTIES REGARDING THE ACCURACY, COMPLETENESS, OR RELIABILITY OF AI OUTPUTS.</strong> We do not claim any guaranteed accuracy percentages; AI outputs may be incomplete, outdated, or incorrect.</p>
    <ul className="list-disc pl-5">
      <li><strong>Hallucinations &amp; Errors:</strong> You acknowledge that AI models are probabilistic and may &quot;hallucinate&quot; or generate text that sounds plausible but is factually incorrect.</li>
      <li><strong>Valuation Disclaimer:</strong> Any estimated values, pricing suggestions, or market analysis generated by the AI are <strong>speculative estimates only</strong>. They do not constitute an appraisal, professional valuation, or guarantee of market value. You bear the sole risk of relying on such pricing for insurance, sale, or tax purposes.</li>
      <li><strong>Dangerous Items:</strong> The AI may fail to identify recalled, illegal, or hazardous items. It is your sole obligation to verify that an item is safe and legal to possess or sell.</li>
    </ul>

    <h3>6. Ownership of Outputs &amp; Indemnification</h3>
    <p>As between you and MyARK, you are deemed the owner of the AI-generated descriptions and content (&quot;Outputs&quot;) created through your account. You are solely responsible for ensuring Outputs do not infringe third-party intellectual property rights. <strong>You agree to indemnify and hold MyARK harmless against any claims alleging that your use of AI Outputs infringes upon third-party rights or violates applicable laws.</strong></p>

    <h3>7. Consent</h3>
    <p>By using AI features in MyARK, you affirmatively consent to the processing of your data by third-party AI Providers as outlined in this Addendum.</p>
  </LegalLayout>
);

export const CookiePolicy: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="Cookie &amp; Tracking Technologies" icon={<Cookie size={32} />} onBack={onBack}>
    <p><strong>Cookie &amp; Tracking Technologies Policy</strong></p>

    <h3>1. Introduction</h3>
    <p>This policy explains how we use cookies, local storage, and similar tracking technologies within our services.</p>

    <h3>2. Technologies We Use</h3>
    <p>We use &quot;Cookies&quot; and similar technologies including HTTP cookies, HTML5 local storage, pixel tags, web beacons, clear GIFs, and mobile software development kits (SDKs) (collectively, &quot;Tracking Technologies&quot;). These are used for:</p>
    <ul className="list-disc pl-5">
      <li><strong>Authentication &amp; Security:</strong> keeping you logged in and preventing fraud.</li>
      <li><strong>Functionality:</strong> saving inventory sessions and user preferences.</li>
      <li><strong>Analytics:</strong> improving platform performance and analyzing usage patterns.</li>
    </ul>

    <h3>3. Third-Party Technologies</h3>
    <p>We may permit third-party service providers (such as payment processors, fraud prevention partners, and analytics providers) to deploy Tracking Technologies on our platform.</p>

    <h3>4. Global Privacy Control (GPC) &amp; Do Not Track</h3>
    <p>Some browsers transmit &quot;Do Not Track&quot; (DNT) signals. Because there is no common industry standard for DNT handling, we do not currently process or respond to DNT signals. However, we process Global Privacy Control (GPC) signals where required by applicable law.</p>

    <h3>5. Managing Your Preferences</h3>
    <p>You may disable cookies in your browser settings or mobile device permissions. Please note that disabling essential Tracking Technologies may render specific features (such as bidding or inventory management) non-functional.</p>

    <h3>6. Updates</h3>
    <p>We may update this policy periodically to reflect changes in technology or regulation.</p>
  </LegalLayout>
);

export const ArkiveAIDisclosure: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="myarkauctions AI Disclosure" icon={<Bot size={32} />} onBack={onBack}>
    <p><strong>myarkauctions AI Disclosure &amp; User Consent Addendum</strong></p>

    <h3>1. Purpose of This Addendum</h3>
    <p>This Addendum supplements the myarkauctions Terms of Service and Privacy Policy, defining the scope and risks of AI integration within the auction platform.</p>

    <h3>2. Use of AI in myarkauctions</h3>
    <p>myarkauctions utilizes AI tools to enhance listing visibility, generate listing data, detect fraud patterns, and identify high-risk listings.</p>

    <h3>3. Data Shared With AI Providers</h3>
    <p>myarkauctions may share listing photos, titles, descriptions, bidding activity patterns, and seller behavior indicators with third-party AI vendors for operational safety and functionality.</p>

    <h3>4. No Training Use Without Consent</h3>
    <p>myarkauctions does not authorize AI vendors to use your data for model training unless explicitly permitted by law or via your express consent.</p>

    <h3>5. AI OUTPUT LIMITATIONS &amp; FINANCIAL RISK</h3>
    <p><strong>AI SUGGESTIONS DO NOT GUARANTEE AUTHENTICITY, PROVENANCE, VALUATION, OR COMPLIANCE.</strong> We do not claim specific accuracy percentages. AI outputs may be incomplete, outdated, or incorrect and must not be used as the sole basis for pricing or compliance decisions.</p>
    <p>You acknowledge that relying on AI-generated listing data or valuations may result in financial loss. All listing decisions, including reserve prices and authenticity representations, remain the <strong>sole responsibility of the seller</strong>. myarkauctions is not liable for items sold below market value or for refund claims resulting from inaccurate AI-generated descriptions.</p>

    <h3>6. Automated Moderation &amp; Account Actions</h3>
    <p>myarkauctions utilizes AI to detect patterns indicative of fraud, shill bidding, or prohibited items. You acknowledge that these automated systems may result in false positives. <strong>myarkauctions reserves the right to suspend listings or accounts based on AI risk scoring without prior notice.</strong> While we may review appeals at our discretion, we are under no obligation to reinstate accounts flagged by our safety algorithms.</p>

    <h3>7. Consent</h3>
    <p>By using myarkauctions features, you consent to the processing of your data by AI providers for operational and safety-related functions.</p>
  </LegalLayout>
);

export const ArkiveAuctionTerms: React.FC<LegalProps> = ({ onBack }) => (
  <LegalLayout title="myarkauctions Terms" icon={<Scale size={32} />} onBack={onBack}>
    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

    <h3>1. Contract Formation &amp; Assent</h3>
    <p>Use of myarkauctions requires an affirmative act of consent (e.g., checking the agreement box during sign-up or when prompted on re-entry). Material updates require renewed assent upon next login; passive notice is insufficient.</p>

    <h3>2. Role &amp; Agent-of-Payee</h3>
    <p>For payments collected for sellers, myarkauctions acts as the seller&apos;s limited payment collection agent solely to receive funds from buyers. Receipt of funds by myarkauctions constitutes receipt by the seller for purposes of the &quot;agent of payee&quot; exemption under applicable money transmission laws. myarkauctions does not hold funds in trust and is not a money transmitter to the extent permitted by law.</p>

    <h3>3. Auctions &amp; Pricing</h3>
    <p>myarkauctions does not use non-public competitor or market data to set or suggest prices and does not coordinate pricing among sellers. Any pricing insights are optional, non-binding, and must be independently evaluated by the seller.</p>

    <h3>4. AI, Authenticity, and Disclaimers</h3>
    <p>AI outputs (including descriptions or indicative valuations) are speculative and may be inaccurate. Sellers are solely responsible for authenticity and compliance. myarkauctions disclaims any guarantee of accuracy and makes no specific performance or accuracy claims.</p>

    <h3>5. Mass Arbitration Protocol</h3>
    <p>Disputes are subject to binding individual arbitration under the American Arbitration Association (AAA) Consumer Rules and AAA Mass Arbitration Supplementary Rules. Claims may be batched for administrative efficiency under those AAA rules; no bellwether process applies. Court claims must be filed in a court of competent jurisdiction if AAA declines jurisdiction.</p>

    <h3>6. Prohibited Conduct</h3>
    <p>Sellers and buyers must not engage in shill bidding, price fixing, or any anticompetitive conduct. Violations may result in suspension or termination.</p>
  </LegalLayout>
);
