
import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, FileText, Award, Menu, Briefcase, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

// --- STATIC DATA ---
const MODULES = [
  { id: 'module-1', title: 'Ecosystem Strategy', description: 'Understand how MyARK, TrueManifest, and ARKive Auctions work together.', duration: '60 min' },
  { id: 'module-2', title: 'Product Deep Dives', description: 'Master the value proposition of each product in the ecosystem.', duration: '120 min' },
  { id: 'module-3', title: 'The Pitch', description: 'Learn discovery, practice pitches, and handle branching conversations.', duration: '90 min' },
  { id: 'module-4', title: 'Battle Cards', description: 'Prepare for competitive questions and common sales objections.', duration: '90 min' },
  { id: 'module-5', title: 'Role Play', description: 'Apply your knowledge through practical exercises.', duration: '120 min' }
];

interface SalesTrainingAppProps {
  onBack: () => void;
}

const SalesTrainingApp: React.FC<SalesTrainingAppProps> = ({ onBack }) => {
    const [view, setView] = useState('dashboard');
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSelectModule = (moduleId: string) => {
        setActiveModule(moduleId);
        setView('module');
        setIsMobileMenuOpen(false);
    };

    const handleNavigate = (newView: string) => {
        setView(newView);
        setActiveModule(null);
        setIsMobileMenuOpen(false);
    };
    
    const renderContent = () => {
        switch(view) {
            case 'resources':
                return (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
                        <div className="mt-6 space-y-4">
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <h3 className="font-bold text-lg">One-Pagers</h3>
                                <p className="text-gray-500 text-sm">Downloadable PDFs for customer presentations.</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <h3 className="font-bold text-lg">Slide Decks</h3>
                                <p className="text-gray-500 text-sm">Master pitch decks and customization guides.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'exam':
                 return (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900">Certification Exam</h1>
                        <div className="mt-6 bg-white p-8 rounded-xl border border-gray-200 text-center">
                            <Award size={48} className="mx-auto text-indigo-500 mb-4" />
                            <h2 className="text-xl font-bold">Ready to certify?</h2>
                            <p className="text-gray-600 my-4 max-w-md mx-auto">This exam consists of 50 questions covering the entire MyARK ecosystem. You need 80% to pass.</p>
                            <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">Start Exam</button>
                        </div>
                    </div>
                 );
            case 'module':
                 const moduleData = MODULES.find(m => m.id === activeModule);
                 return (
                    <div className="p-6">
                        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">{moduleData?.title || 'Module'}</h1>
                        <p className="text-gray-500 mt-2">{moduleData?.description}</p>
                        
                        <div className="mt-8 p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                            <p className="text-gray-400 font-medium">Interactive training content loading...</p>
                        </div>
                    </div>
                 );
            case 'dashboard':
            default:
                 return (
                     <div className="p-6">
                         <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Dashboard</h1>
                         <p className="text-gray-500 mb-8">Welcome! Select a module to begin your training.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MODULES.map((mod, index) => (
                                <button key={mod.id} onClick={() => handleSelectModule(mod.id)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all text-left group flex flex-col h-full">
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Module {index + 1}</p>
                                            <h2 className="text-lg font-bold text-gray-800 mt-1">{mod.title}</h2>
                                        </div>
                                        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                           <BookOpen size={20} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-3 flex-1">{mod.description}</p>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between w-full">
                                        <span className="text-xs font-medium text-gray-400">{mod.duration}</span>
                                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">Start <ArrowRight size={12}/></span>
                                    </div>
                                </button>
                            ))}
                         </div>
                     </div>
                 );
        }
    };

    return (
        <div className="w-full h-full flex bg-gray-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0">
                <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Briefcase size={20}/></div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Training</h1>
                        <p className="text-xs text-gray-500">Internal Portal</p>
                    </div>
                </div>
                 <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <button onClick={() => handleNavigate('dashboard')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm w-full text-left ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button onClick={() => handleNavigate('resources')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm w-full text-left ${view === 'resources' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <FileText size={18} /> Resources
                    </button>
                    <button onClick={() => handleNavigate('exam')} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm w-full text-left ${view === 'exam' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <Award size={18} /> Certification
                    </button>
                    
                    <div className="pt-6 pb-2 px-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Modules</div>
                    {MODULES.map(mod => (
                        <button key={mod.id} onClick={() => handleSelectModule(mod.id)} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all text-xs w-full text-left ${activeModule === mod.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                           {mod.title}
                        </button>
                    ))}
                </nav>
                 <div className="p-4 border-t border-gray-200">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={16} /> Exit Training</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Briefcase size={20} className="text-indigo-600"/>
                        <span className="font-bold text-gray-800">Training Portal</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md hover:bg-gray-100">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {renderContent()}
                </div>
            </main>
            
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute top-0 left-0 bottom-0 w-72 bg-white p-4 shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                         <nav className="flex-1 space-y-2">
                            <button onClick={() => handleNavigate('dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm w-full text-left hover:bg-gray-100 text-gray-700">
                                <LayoutDashboard size={18} /> Dashboard
                            </button>
                            <button onClick={() => handleNavigate('resources')} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm w-full text-left hover:bg-gray-100 text-gray-700">
                                <FileText size={18} /> Resources
                            </button>
                            <button onClick={() => handleNavigate('exam')} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm w-full text-left hover:bg-gray-100 text-gray-700">
                                <Award size={18} /> Certification
                            </button>
                            
                            <div className="pt-4 px-4 text-xs font-bold uppercase text-gray-400">Modules</div>
                            {MODULES.map(mod => (
                                <button key={mod.id} onClick={() => handleSelectModule(mod.id)} className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm w-full text-left hover:bg-gray-100 text-gray-600">
                                   {mod.title}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-8 border-t border-gray-100 pt-4">
                             <button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"><ArrowLeft size={16} /> Exit to MyARK</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesTrainingApp;
