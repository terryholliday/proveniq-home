import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, AlertTriangle, X, Search, MapPin, HelpCircle, Loader2, ArrowLeft, ScanLine } from 'lucide-react';
import { InventoryItem, Anomaly } from '@/lib/types';
import { auditRoom } from '@/services/backendService';

interface SpaceMapperProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onBack: () => void;
}

type ScanState = 'selecting_room' | 'scanning' | 'analyzing' | 'results';

const SpaceMapper: React.FC<SpaceMapperProps> = ({ items, onSelectItem, onBack }) => {
  const [scanState, setScanState] = useState<ScanState>('selecting_room');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Anomaly[] | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const locations = useMemo(() => Array.from(new Set(items.map(i => i.location).filter((loc): loc is string => !!loc))), [items]);

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
  };

  useEffect(() => {
    const startScanning = async () => {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access denied:", err);
          setCameraError("Camera access was denied. Please enable camera permissions in your browser settings.");
          setScanState('selecting_room');
        }
      } else {
        setCameraError("Your browser does not support camera access.");
        setScanState('selecting_room');
      }
    };

    if (scanState === 'scanning') {
      startScanning();
    } else {
      stopScanning();
    }

    return () => stopScanning();
  }, [scanState]);


  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setScanState('scanning');
    setAnalysisError(null); // Clear previous errors
  };

  const handleAnalyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedLocation) return;

    setScanState('analyzing');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameImage = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const itemsInLocation = items.filter(i => i.location === selectedLocation);
      const result = await auditRoom(frameImage, selectedLocation, itemsInLocation, items);
      setAnalysisResult(result);
      setScanState('results');
    } catch (error) {
      console.error("Audit failed", error);
      setAnalysisError("The AI audit failed. Please check your connection and try again.");
      setScanState('selecting_room'); // Return to selection screen on failure
    }
  };

  const reset = () => {
    setScanState('selecting_room');
    setSelectedLocation(null);
    setAnalysisResult(null);
    setCameraError(null);
    setAnalysisError(null);
  };

  const renderAnomalyItem = (anomaly: Anomaly) => {
    const matchedItem = items.find(i => i.name.toLowerCase() === anomaly.itemName?.toLowerCase());
    const canNavigate = !!matchedItem;

    const content = (
      <>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">{anomaly.itemName || 'Unknown Item'}</p>
          <p className="text-xs text-gray-500 italic">{anomaly.description}</p>
        </div>
        {anomaly.type === 'misplaced' && (
          <div className="text-right text-xs">
            <p className="font-bold text-gray-500">Belongs in:</p>
            <p className="font-semibold text-red-600">{anomaly.originalLocation}</p>
          </div>
        )}
      </>
    );

    if (canNavigate) {
      return (
        <button key={anomaly.itemName} onClick={() => onSelectItem(matchedItem!)} className="w-full text-left flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          {content}
        </button>
      );
    }
    return (
      <div key={anomaly.itemName} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
        {content}
      </div>
    );
  };

  if (scanState === 'scanning' || scanState === 'analyzing') {
    return (
      <div className="bg-black rounded-xl shadow-sm h-full flex flex-col items-center justify-center relative overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />

        {scanState === 'analyzing' ? (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="text-lg font-bold">AI is analyzing the room...</p>
            <p className="text-sm opacity-80">Please wait a moment.</p>
          </div>
        ) : (
          <>
            {/* Scanning Laser Effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none">
              <div className="absolute w-full h-1 bg-red-500/70 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)] animate-scan-y"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 p-6 flex flex-col justify-end">
              <button onClick={handleAnalyzeFrame} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-3">
                <ScanLine size={24} /> Capture & Analyze Frame
              </button>
            </div>
            <button onClick={reset} className="absolute top-4 left-4 z-20 p-2 bg-white/80 text-gray-800 rounded-full hover:bg-white shadow-md backdrop-blur-sm">
              <X size={20} />
            </button>
          </>
        )}
      </div>
    );
  }

  if (scanState === 'results') {
    const misplaced = analysisResult?.filter(a => a.type === 'misplaced') || [];
    const missing = analysisResult?.filter(a => a.type === 'missing') || [];
    const unexpected = analysisResult?.filter(a => a.type === 'unexpected') || [];

    return (
      <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Audit Results for &quot;{selectedLocation}&quot;</h2>
            <p className="text-sm text-gray-500">The AI has identified the following discrepancies.</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          {misplaced.length > 0 && <div><h3 className="font-bold text-red-600 flex items-center gap-2 mb-2"><MapPin size={16} /> Misplaced Items ({misplaced.length})</h3><div className="space-y-2">{misplaced.map(renderAnomalyItem)}</div></div>}
          {missing.length > 0 && <div><h3 className="font-bold text-orange-600 flex items-center gap-2 mb-2"><Search size={16} /> Missing Items ({missing.length})</h3><div className="space-y-2">{missing.map(renderAnomalyItem)}</div></div>}
          {unexpected.length > 0 && <div><h3 className="font-bold text-blue-600 flex items-center gap-2 mb-2"><HelpCircle size={16} /> Unexpected Items ({unexpected.length})</h3><div className="space-y-2">{unexpected.map(renderAnomalyItem)}</div></div>}
          {(misplaced.length + missing.length + unexpected.length) === 0 && <div className="text-center py-12 text-gray-500"><p className="font-semibold">Looks like everything is in order!</p><p className="text-sm">No discrepancies were found in this scan.</p></div>}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <button onClick={reset} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Start a New Audit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Camera size={24} /></div>
          <div><h2 className="text-2xl font-bold text-gray-900">Room Audit</h2><p className="text-gray-500 text-sm">Scan a room to detect misplaced or missing items.</p></div>
        </div>
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X size={20} /></button>
      </div>
      <div className="flex-1 p-6 space-y-4">
        <h3 className="font-bold text-gray-800">Select a location to audit:</h3>
        {cameraError && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2"><AlertTriangle size={18} className="shrink-0 mt-0.5" /><span>{cameraError}</span></div>}
        {analysisError && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2"><AlertTriangle size={18} className="shrink-0 mt-0.5" /><span>{analysisError}</span></div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map(loc => (
            <button key={loc} onClick={() => handleSelectLocation(loc)} className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-left font-semibold text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
              {loc}
            </button>
          ))}
          {locations.length === 0 && <p className="text-sm text-gray-400 p-4">Add items to your inventory to create locations first.</p>}
        </div>
      </div>
    </div>
  );
};

export default SpaceMapper;
