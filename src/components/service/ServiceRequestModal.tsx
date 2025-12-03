import React, { useState } from 'react';
import { InventoryItem, ServiceProvider } from '@/lib/types';
import { X, Wrench, Info, Send, Loader2, CheckCircle, Sparkles, Users, UserCheck, Star } from 'lucide-react';
import { generateRepairEstimate } from '@/services/backendService';

interface ServiceRequestModalProps {
  item: InventoryItem;
  onClose: () => void;
}

type ServiceStep = 'form' | 'estimating' | 'options' | 'provider_list' | 'submitting' | 'success';

const mockProviders: ServiceProvider[] = [
    { id: 'pro1', name: 'John\'s Appliance Repair', specialty: 'Appliance Specialist', rating: 4.8 },
    { id: 'pro2', name: 'Handy Mandy Services', specialty: 'General Handyman', rating: 4.9 },
    { id: 'pro3', name: 'Tech Restore Inc.', specialty: 'Electronics & Computers', rating: 4.7 },
];

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ item, onClose }) => {
  const [step, setStep] = useState<ServiceStep>('form');
  const [problem, setProblem] = useState('');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [finalMessage, setFinalMessage] = useState({ title: '', body: '' });
  const [estimate, setEstimate] = useState<{ costEstimateMin: number, costEstimateMax: number, commissionRate: number, reasoning: string } | null>(null);

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      alert("Please describe the problem.");
      return;
    }
    setStep('estimating');
    try {
        const est = await generateRepairEstimate(item.name, problem);
        setEstimate(est);
        setStep('options');
    } catch(err) {
        console.error("Estimate failed", err);
        // Fallback if AI fails
        setEstimate({
            costEstimateMin: 50,
            costEstimateMax: 200,
            commissionRate: 15,
            reasoning: "AI estimate failed. A technician will provide a quote."
        });
        setStep('options');
    }
  };
  
  const handleChooseOption = (option: 'choose' | 'bid') => {
      if (option === 'choose') {
          setStep('provider_list');
      } else {
          setStep('submitting');
          setFinalMessage({
              title: "Request Sent for Bids!",
              body: "Local MyARK Pros have been notified. You&apos;ll receive bids in your service dashboard shortly."
          });
          // Simulate submission
          setTimeout(() => setStep('success'), 1500);
      }
  };

  const handleSelectProvider = (provider: ServiceProvider) => {
      setStep('submitting');
      setFinalMessage({
          title: "Service Request Sent!",
          body: `Your request has been sent to ${provider.name}. They will contact you shortly to confirm the appointment.`
      });
      setTimeout(() => setStep('success'), 1500);
  };
  
  const renderContent = () => {
      switch (step) {
          case 'estimating':
              return (
                  <div className="text-center p-8">
                      <Loader2 size={48} className="text-indigo-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">AI Is On The Job</h3>
                      <p className="text-gray-500 mt-2">Analyzing the problem to generate a cost estimate...</p>
                  </div>
              );
          case 'submitting':
               return (
                  <div className="text-center p-8">
                      <Send size={48} className="text-indigo-500 animate-pulse mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">Sending Your Request...</h3>
                      <p className="text-gray-500 mt-2">Connecting you with our network of professionals.</p>
                  </div>
              );
          case 'success':
              return (
                   <div className="text-center p-8">
                      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">{finalMessage.title}</h3>
                      <p className="text-gray-600 mt-2 max-w-sm mx-auto">{finalMessage.body}</p>
                      <button onClick={onClose} className="w-full mt-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Done</button>
                  </div>
              );
          case 'options':
              if (!estimate) return null;
              return (
                   <div className="p-6 space-y-6">
                      <div className="text-center">
                        <div className="inline-block p-2 bg-indigo-100 text-indigo-600 rounded-full mb-2"><Sparkles size={24}/></div>
                        <h3 className="text-xl font-bold text-gray-900">AI Repair Estimate</h3>
                        <p className="text-sm text-gray-500">For your &quot;{item.name}&quot;</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                          <p className="text-xs font-bold uppercase text-gray-500">Estimated Cost</p>
                          <p className="text-4xl font-extrabold text-indigo-700 my-2">${estimate.costEstimateMin} - ${estimate.costEstimateMax}</p>
                          <p className="text-xs text-gray-600 px-4">{estimate.reasoning}</p>
                      </div>
                      <div className="bg-green-50 text-green-800 text-xs p-3 rounded-lg border border-green-100">
                          <strong>Platform Fee:</strong> MyARK will take a {estimate.commissionRate}% commission from the provider&apos;s final fee. This helps us maintain a network of trusted professionals.
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button onClick={() => handleChooseOption('choose')} className="p-4 border-2 border-indigo-200 rounded-xl text-left hover:bg-indigo-50 hover:border-indigo-500 transition-all group">
                                <UserCheck size={24} className="text-indigo-600 mb-2"/>
                                <h4 className="font-bold text-gray-900">Choose a MyARK Pro</h4>
                                <p className="text-sm text-gray-600">Select from a list of our top-rated, certified service providers.</p>
                            </button>
                             <button onClick={() => handleChooseOption('bid')} className="p-4 border-2 border-gray-200 rounded-xl text-left hover:bg-gray-50 hover:border-gray-500 transition-all group">
                                <Users size={24} className="text-gray-600 mb-2"/>
                                <h4 className="font-bold text-gray-900">Get Competing Bids</h4>
                                <p className="text-sm text-gray-600">Let providers in your area bid on the job to get the best price.</p>
                            </button>
                       </div>
                   </div>
              );
          case 'provider_list':
              return (
                  <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-gray-900">Choose a MyARK Pro</h3>
                      <div className="space-y-3">
                          {mockProviders.map(pro => (
                              <button key={pro.id} onClick={() => handleSelectProvider(pro)} className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <p className="font-bold text-gray-800">{pro.name}</p>
                                          <p className="text-xs text-gray-500">{pro.specialty}</p>
                                      </div>
                                      <div className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                          <Star size={12} fill="currentColor"/> {pro.rating}
                                      </div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              );
          case 'form':
          default:
              return (
                  <form onSubmit={handleSubmitProblem} className="space-y-6 p-6">
                      <div>
                          <label htmlFor="problem" className="text-sm font-bold text-gray-700">Describe the problem</label>
                          <textarea 
                              id="problem" 
                              value={problem} 
                              onChange={e => setProblem(e.target.value)}
                              rows={4}
                              className="w-full mt-1 p-3 bg-white text-gray-900 border border-gray-300 rounded-lg"
                              placeholder={`e.g., &quot;The ice maker is not working&quot;, &quot;The screen is cracked&quot;`}
                              required
                          />
                      </div>
                      <div>
                          <label className="text-sm font-bold text-gray-700">Preferred Dates (Optional)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                              <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg" />
                              <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg" />
                          </div>
                      </div>
                       <div className="p-3 bg-indigo-50 text-indigo-800 text-sm rounded-lg border border-indigo-100 flex items-start gap-2">
                          <Info size={16} className="shrink-0 mt-0.5"/>
                          <p>
                             After you submit, our AI will generate a cost estimate. You can then choose a provider or let them bid on your job.
                          </p>
                       </div>
                       <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">
                           Get AI Estimate <Sparkles size={16}/>
                       </button>
                  </form>
              );
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><Wrench size={20} /></div>
            <h3 className="text-lg font-bold text-gray-900">Request Service for &quot;{item.name}&quot;</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default ServiceRequestModal;
