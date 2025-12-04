'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ItemTimeline } from './ItemTimeline';
import { ProvenanceCertificate } from './ProvenanceCertificate';
import { Printer } from 'lucide-react';

interface ProvenanceModalProps {
    item: InventoryItem;
    onClose: () => void;
}

export function ProvenanceModal({ item, onClose }: ProvenanceModalProps) {
    const [activeTab, setActiveTab] = useState('timeline');

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:w-full print:h-full print:border-none print:shadow-none">
                <DialogHeader className="print:hidden">
                    <DialogTitle>Provenance & Ownership</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-4 print:hidden">
                        <TabsList>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="certificate">Certificate</TabsTrigger>
                        </TabsList>

                        {activeTab === 'certificate' && (
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print / Save PDF
                            </Button>
                        )}
                    </div>

                    <TabsContent value="timeline">
                        <ItemTimeline item={item} />
                    </TabsContent>

                    <TabsContent value="certificate">
                        <div className="print:block">
                            <ProvenanceCertificate item={item} />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
