import { Mail, MapPin } from 'lucide-react';
import { MyArkLogo } from '@/components/onboarding/MyArkLogo';

export function AutopilotIllustration(): JSX.Element {
    return (
        <div className="relative h-80 w-80 flex flex-col items-center justify-center gap-8">
            <svg width="120" height="180" viewBox="0 0 120 180" className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <path d="M60 40 v-20" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" className="animate-dash-in" />
                <path d="M60 140 v20" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" className="animate-dash-out" />
            </svg>
            <div className="z-10 flex items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <p className="font-bold">Purchase Found!</p>
                    <p className="text-sm text-gray-500">Sony Headphones - $349.99</p>
                </div>
            </div>
            <div className="z-10 bg-white rounded-full shadow-2xl p-4 pulse-grow">
                <MyArkLogo size={48} />
            </div>
            <div className="z-10 flex items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <p className="font-bold">Near Home Depot?</p>
                    <p className="text-sm text-gray-500">Don&apos;t forget to scan new items.</p>
                </div>
            </div>
        </div>
    );
}
