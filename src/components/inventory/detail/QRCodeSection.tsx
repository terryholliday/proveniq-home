'use client';

import { InventoryItem } from "@/lib/types";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import { QrCode, Copy } from "lucide-react";

interface QRCodeSectionProps {
    item: InventoryItem;
}

declare global {
    interface Window {
        qrcode: unknown;
    }
}

export function QRCodeSection({ item }: QRCodeSectionProps) {
    const qrValue = JSON.stringify({ id: item.id, name: item.name });

    const downloadQR = () => {
        const canvas = document.querySelector('#qr-code-canvas canvas') as HTMLCanvasElement;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `${item.name.replace(/\s+/g, '-')}-qr-code.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    const copyQRValue = () => {
        navigator.clipboard.writeText(qrValue);
        alert('QR Code data copied to clipboard!');
    };

    return (
        <Section title="QR Code Label" icon={<QrCode className="h-5 w-5"/>}>
            <div className="flex flex-col md:flex-row items-center gap-6 bg-muted/50 p-4 rounded-lg border">
                <div id="qr-code-canvas" className="p-2 bg-white rounded-lg shadow-sm">
                    {/* The QR code will be rendered here by a script, assuming qrcode.js is loaded globally */}
                    <canvas id={`qr-canvas-${item.id}`}></canvas>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold">Item Identification</h4>
                    <p className="text-sm text-muted-foreground">
                        Print this QR code and attach it to your item. Scanning it with the Proveniq Home app will bring you directly to this page.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={downloadQR}>Download PNG</Button>
                        <Button variant="outline" onClick={copyQRValue}><Copy className="mr-2 h-4 w-4"/> Copy Data</Button>
                    </div>
                </div>
            </div>
             <script
                dangerouslySetInnerHTML={{
                    __html: `
                        if (window.qrcode) {
                            const canvas = document.getElementById('qr-canvas-${item.id}');
                            if (canvas) {
                                window.qrcode.toCanvas(canvas, '${qrValue}', { width: 128, margin: 1 });
                            }
                        }
                    `,
                }}
            />
        </Section>
    );
}
