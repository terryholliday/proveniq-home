export function MoveIllustration(): JSX.Element {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-bold text-lg mb-3">Kitchen Box #3</h3>
            <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">Le Creuset Dutch Oven</span>
                    <span className="text-xs font-mono text-gray-400">...a4b1</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">Vitamix Blender</span>
                    <span className="text-xs font-mono text-gray-400">...c8d2</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">Dinner Plate Set</span>
                    <span className="text-xs font-mono text-gray-400">...e3f4</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-center">
                <p className="text-sm text-gray-500">Scan QR to see all 24 items</p>
            </div>
        </div>
    );
}
