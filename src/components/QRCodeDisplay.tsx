import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { InventoryItem } from '@/lib/types';
import { QrCode, ScanLine, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  item: InventoryItem;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ item }) => {
  const [mode, setMode] = useState<'qr' | 'barcode'>('qr');
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // QR Data contains richer information
  const qrData = JSON.stringify({
    id: item.id,
    name: item.name,
    cat: item.category,
    loc: item.location
  });

  // Barcode typically holds just the ID for lookups
  const barcodeData = item.id;

  const handlePrint = () => {
    const svgContent = codeContainerRef.current?.innerHTML;
    if (!svgContent) return;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Asset Tag - ${item.name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: sans-serif;
              }
              .tag-container {
                border: 2px solid #000;
                padding: 24px;
                border-radius: 12px;
                text-align: center;
                max-width: 300px;
              }
              .item-name {
                font-weight: bold;
                font-size: 20px;
                margin-top: 16px;
                margin-bottom: 8px;
                line-height: 1.2;
              }
              .item-id {
                font-family: monospace;
                color: #555;
                font-size: 14px;
              }
              svg {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            <div class="tag-container">
              ${svgContent}
              <div class="item-name">${item.name}</div>
              <div class="item-id">${item.id}</div>
            </div>
            <script>
              window.onload = () => {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* Toggle Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full mb-6">
        <button
          onClick={() => setMode('qr')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'qr'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <QrCode size={16} />
          QR Code
        </button>
        <button
          onClick={() => setMode('barcode')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'barcode'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <ScanLine size={16} />
          Barcode
        </button>
      </div>

      {/* Code Display Area */}
      <div
        ref={codeContainerRef}
        onClick={handlePrint}
        title="Click to print tag"
        className="bg-white p-4 rounded-lg border border-gray-100 shadow-inner mb-4 flex items-center justify-center min-h-[200px] w-full overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors group relative"
      >
        {mode === 'qr' ? (
          <QRCode value={qrData} size={160} />
        ) : (
          <div className="flex items-center justify-center w-full overflow-x-auto">
            <Barcode
              value={barcodeData}
              width={2}
              height={100}
              fontSize={16}
              background="transparent"
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">Click to Print</span>
        </div>
      </div>

      <div className="text-center mb-5">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Asset Tag</p>
        <h4 className="font-bold text-gray-800">{item.name}</h4>
        <p className="text-sm text-gray-500 font-mono">{item.id}</p>
      </div>

      <button
        onClick={handlePrint}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
      >
        <Printer size={16} />
        Print Asset Tag
      </button>
    </div>
  );
};

export default QRCodeDisplay;
