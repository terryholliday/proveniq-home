import { Camera, ArrowRight, Video, GanttChartSquare } from 'lucide-react';
import { Facebook } from 'lucide-react';

export function ValueIllustration(): JSX.Element {
    return (
        <div className="flex items-center justify-center gap-4 md:gap-8 p-4">
            {/* Item Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-40 text-center">
                <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-bold text-sm">Vintage Camera</p>
                <p className="text-xs text-gray-500 mt-1">$150 Value</p>
            </div>

            <ArrowRight className="text-gray-300 h-6 w-6 shrink-0" />

            {/* Marketplace Card */}
            <div className="relative bg-white rounded-2xl shadow-lg p-4 w-64">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md transform rotate-12">
                    SOLD!
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center">
                        <Facebook className="h-4 w-4 text-white" fill="white" />
                    </div>
                    <p className="font-bold text-sm">Marketplace</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-xs text-gray-600 mb-3">
                    &quot;Selling my classic film camera. Great condition, works perfectly...&quot;
                </div>
                <div className="flex justify-between items-center">
                    <p className="font-bold text-blue-600 text-sm">$175 OBO</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <GanttChartSquare className="h-3 w-3" />
                        <span>Bids Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
