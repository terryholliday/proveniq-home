import React, { useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Package } from 'lucide-react';
import { Box, InventoryItem } from '@/lib/types';

interface PrintableBoxLabelProps {
  box: Box;
  items: InventoryItem[];
  onDone: () => void;
}

const PrintableBoxLabel: React.FC<PrintableBoxLabelProps> = ({ box, items, onDone }) => {
  useEffect(() => {
    window.print();
    // After the print dialog is closed (or cancelled), navigate back.
    // We use a small timeout to allow the print dialog to appear.
    const timer = setTimeout(onDone, 500);
    return () => clearTimeout(timer);
  }, [onDone]);
  
  const qrData = JSON.stringify({
      type: 'PROVENIQ Home_box',
      boxId: box.id,
      moveId: box.moveId
  });

  return (
    <div className="bg-white text-black p-4" style={{ width: '8.5in', height: '11in' }}>
      <style>{`
        @media print {
          @page { size: letter; margin: 0.5in; }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
      <button onClick={onDone} className="no-print fixed top-4 right-4 bg-gray-200 px-4 py-2 rounded">Done</button>
      
      <div className="border-4 border-black h-full flex flex-col p-8">
        <div className="text-center border-b-4 border-black pb-4">
          <p className="text-3xl font-bold uppercase tracking-wider">Move: {box.moveId.replace('move_', '')}</p>
          <h1 className="text-8xl font-black my-4" style={{ letterSpacing: '-0.05em' }}>BOX #{box.id.replace('box_', '').slice(-4)}</h1>
          {box.destinationRoom && (
              <p className="text-4xl font-semibold bg-black text-white inline-block px-6 py-2">
                DESTINATION: {box.destinationRoom.toUpperCase()}
              </p>
          )}
        </div>

        <div className="flex-1 flex pt-6">
            <div className="w-2/3 pr-6 border-r-4 border-black">
                <h2 className="text-2xl font-bold uppercase border-b-2 border-black mb-2 pb-1">Contents ({items.length} items)</h2>
                <ul className="text-xl space-y-1 overflow-hidden h-[5.5in]">
                    {items.map(item => <li key={item.id} className="truncate">- {item.name}</li>)}
                    {items.length > 15 && <li className="font-bold">... and more.</li>}
                </ul>
            </div>
            <div className="w-1/3 pl-6 flex flex-col items-center justify-center">
                <div className="bg-white p-2 border-2 border-black">
                    <QRCode value={qrData} size={200} />
                </div>
                <p className="mt-4 text-center font-semibold text-lg flex items-center gap-2">
                    <Package size={24} /> Scan with PROVENIQ Home
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableBoxLabel;
