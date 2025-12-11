export function AskYourProveniqIllustration(): JSX.Element {
    return (
        <div className="relative w-full max-w-sm h-64 flex items-center justify-center p-4">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Left Device */}
                <div className="z-10 absolute left-4 w-40 h-56 bg-gray-800 rounded-2xl flex flex-col items-center justify-center p-4 shadow-2xl transform -rotate-6">
                    <div className="w-5 h-5 bg-blue-400 rounded-full mb-3 animate-pulse" />
                    <p className="text-white text-sm text-center font-medium">&quot;Alexa, ask Proveniq Home where Grandma&apos;s bracelet is.&quot;</p>
                </div>

                {/* Right Device */}
                <div className="z-10 absolute right-4 w-40 h-56 bg-white rounded-2xl flex flex-col items-center justify-center p-4 shadow-2xl transform rotate-6">
                    <div className="flex space-x-1.5 mb-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <p className="text-gray-800 text-sm text-center font-medium">&quot;Hey Google, what&apos;s my passport&apos;s current value?&quot;</p>
                </div>
            </div>
        </div>
    );
}
