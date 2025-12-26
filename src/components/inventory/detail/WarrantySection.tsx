'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Section, Field } from './Section';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WarrantySectionProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

const warrantyTypes = [
  { value: 'manufacturer', label: 'Manufacturer Warranty' },
  { value: 'extended', label: 'Extended Warranty' },
  { value: 'retailer', label: 'Retailer Warranty' },
  { value: 'service_plan', label: 'Service Plan' },
];

function getWarrantyStatus(expirationDate?: string): { status: 'active' | 'expiring' | 'expired' | 'unknown'; daysLeft: number } {
  if (!expirationDate) return { status: 'unknown', daysLeft: 0 };
  
  const expDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return { status: 'expired', daysLeft };
  if (daysLeft <= 30) return { status: 'expiring', daysLeft };
  return { status: 'active', daysLeft };
}

export function WarrantySection({ item, onUpdate }: WarrantySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [warranty, setWarranty] = useState(item.warranty || {
    hasWarranty: false,
    provider: '',
    type: undefined,
    expirationDate: '',
    coverageDetails: '',
    claimPhone: '',
    claimUrl: '',
    policyNumber: '',
  });

  const handleSave = () => {
    onUpdate({ warranty: warranty.hasWarranty ? warranty : undefined });
    setIsEditing(false);
  };

  const updateWarranty = (key: string, value: string | boolean) => {
    setWarranty(prev => ({ ...prev, [key]: value }));
  };

  const { status, daysLeft } = getWarrantyStatus(warranty.expirationDate);

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Active ({daysLeft} days left)</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" /> Expiring Soon ({daysLeft} days)</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="secondary">No Expiration Set</Badge>;
    }
  };

  if (!warranty.hasWarranty && !isEditing) {
    return (
      <Section title="Warranty" icon={<Shield className="h-5 w-5" />} isEditing={isEditing} onEditToggle={setIsEditing} onSave={handleSave}>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">No warranty information recorded</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => {
            setWarranty(prev => ({ ...prev, hasWarranty: true }));
            setIsEditing(true);
          }}>
            Add Warranty
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Warranty" icon={<Shield className="h-5 w-5" />} isEditing={isEditing} onEditToggle={setIsEditing} onSave={handleSave}>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasWarranty"
              checked={warranty.hasWarranty}
              onChange={(e) => updateWarranty('hasWarranty', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="hasWarranty" className="text-sm font-medium">This item has a warranty</label>
          </div>

          {warranty.hasWarranty && (
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Warranty Provider">
                <Input
                  value={warranty.provider || ''}
                  onChange={(e) => updateWarranty('provider', e.target.value)}
                  placeholder="e.g., Apple, Best Buy, SquareTrade"
                />
              </Field>
              
              <Field label="Warranty Type">
                <Select value={warranty.type || ''} onValueChange={(val) => updateWarranty('type', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warrantyTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Expiration Date">
                <Input
                  type="date"
                  value={warranty.expirationDate || ''}
                  onChange={(e) => updateWarranty('expirationDate', e.target.value)}
                />
              </Field>

              <Field label="Policy/Contract Number">
                <Input
                  value={warranty.policyNumber || ''}
                  onChange={(e) => updateWarranty('policyNumber', e.target.value)}
                  placeholder="e.g., WRN-123456"
                />
              </Field>

              <Field label="Claims Phone">
                <Input
                  type="tel"
                  value={warranty.claimPhone || ''}
                  onChange={(e) => updateWarranty('claimPhone', e.target.value)}
                  placeholder="1-800-XXX-XXXX"
                />
              </Field>

              <Field label="Claims Website">
                <Input
                  type="url"
                  value={warranty.claimUrl || ''}
                  onChange={(e) => updateWarranty('claimUrl', e.target.value)}
                  placeholder="https://..."
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Coverage Details">
                  <Textarea
                    value={warranty.coverageDetails || ''}
                    onChange={(e) => updateWarranty('coverageDetails', e.target.value)}
                    placeholder="What does this warranty cover? Any exclusions?"
                    rows={3}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{warranty.provider || 'Unknown Provider'}</span>
              {warranty.type && (
                <Badge variant="outline" className="capitalize">{warranty.type.replace('_', ' ')}</Badge>
              )}
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {warranty.expirationDate && (
              <Field label="Expires">
                <p className="font-semibold">{new Date(warranty.expirationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </Field>
            )}
            
            {warranty.policyNumber && (
              <Field label="Policy Number">
                <p className="font-semibold font-mono">{warranty.policyNumber}</p>
              </Field>
            )}
          </div>

          {warranty.coverageDetails && (
            <Field label="Coverage">
              <p className="text-muted-foreground whitespace-pre-wrap">{warranty.coverageDetails}</p>
            </Field>
          )}

          <div className="flex gap-2 pt-2">
            {warranty.claimPhone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${warranty.claimPhone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  {warranty.claimPhone}
                </a>
              </Button>
            )}
            {warranty.claimUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={warranty.claimUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  File Claim Online
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}
