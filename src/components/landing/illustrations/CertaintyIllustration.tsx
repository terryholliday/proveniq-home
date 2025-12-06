import { CloudRain, Shield, Home, Check } from 'lucide-react';

export function CertaintyIllustration(): JSX.Element {
    return (
        <div className="relative w-full max-w-sm h-80 flex items-center justify-center">
            <div className="absolute -left-8 top-10 animate-bounce-slow">
                <CloudRain className="h-24 w-24 text-gray-300" />
            </div>
            <div className="relative flex items-center justify-center">
                <Shield className="h-48 w-48 text-gray-100" fill="currentColor" />
                <div className="absolute flex flex-col items-center justify-center">
                    <Home className="h-20 w-20 text-primary" />
                    <div className="absolute -right-3 -bottom-3 bg-green-500 rounded-full p-1 border-4 border-white">
                        <Check className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>
            <div className="absolute -right-8 top-10 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                <CloudRain className="h-24 w-24 text-gray-300" />
            </div>
        </div>
    );
}
