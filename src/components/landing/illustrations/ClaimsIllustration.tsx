import { AlertTriangle, Tv2, ArrowRight, Check, FileText } from 'lucide-react';

export function ClaimsIllustration(): JSX.Element {
    return (
        <div className="flex items-center justify-center gap-4 md:gap-8 p-4">
            {/* Damaged Item Card */}
            <div className="relative bg-white rounded-2xl shadow-lg p-6 w-40 text-center border-2 border-red-200">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Tv2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-bold text-sm">Smart TV</p>
                <p className="text-xs text-red-600 mt-1">Screen Cracked</p>
            </div>

            <ArrowRight className="text-gray-300 h-6 w-6 shrink-0" />

            {/* Claim Filed Card */}
            <div className="relative bg-white rounded-2xl shadow-lg p-6 w-48 text-center border-2 border-green-200">
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <Check className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-bold text-sm">Claim Filed</p>
                <p className="text-xs text-gray-500 mt-1">Ref: W-1A2B3C</p>
            </div>
        </div>
    );
}
