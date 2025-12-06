import { Gift, Gavel, ShieldCheck, TrendingUp, Truck, Wrench } from 'lucide-react';
import { MyArkLogo } from '@/components/onboarding/MyArkLogo';

export function CommandCenterIllustration(): JSX.Element {
    const icons = [
        { icon: <Gift className="h-8 w-8 text-pink-500" />, name: 'Legacy' },
        { icon: <Gavel className="h-8 w-8 text-purple-500" />, name: 'Auctions' },
        { icon: <ShieldCheck className="h-8 w-8 text-green-500" />, name: 'Insure' },
        { icon: <TrendingUp className="h-8 w-8 text-blue-500" />, name: 'Value' },
        { icon: <Truck className="h-8 w-8 text-orange-500" />, name: 'Logistics' },
        { icon: <Wrench className="h-8 w-8 text-gray-700" />, name: 'Repair' },
    ];

    return (
        <div className="relative w-80 h-80 flex items-center justify-center">
            <div className="absolute w-full h-full animate-rotate">
                {icons.map((item, index) => {
                    const angle = (index / icons.length) * 360;
                    const x = 50 + 40 * Math.cos((angle - 90) * (Math.PI / 180));
                    const y = 50 + 40 * Math.sin((angle - 90) * (Math.PI / 180));
                    return (
                        <div key={item.name} className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                            <div className="bg-white rounded-lg shadow-md p-3 flex flex-col items-center animate-rotate-reverse">
                                {item.icon}
                                <span className="text-xs mt-1">{item.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="bg-white rounded-full shadow-2xl p-4 pulse-grow">
                <MyArkLogo size={64} />
            </div>
        </div>
    );
}
