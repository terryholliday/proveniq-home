import { Search } from 'lucide-react';

export function SearchEngineIllustration(): JSX.Element {
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center border border-gray-200 rounded-lg p-3 mb-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <p className="text-gray-800">Passport</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {['Living', 'Kitchen', 'Bedroom', 'Office'].map(tag => (
                    <div key={tag} className="bg-primary/5 text-primary/80 rounded-md p-3 text-center text-sm font-medium">
                        {tag}
                    </div>
                ))}
            </div>
        </div>
    );
}
