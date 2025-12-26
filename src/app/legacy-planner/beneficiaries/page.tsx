'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit2, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Beneficiary } from '@/lib/types';

const relationships = [
  'Spouse', 'Child', 'Parent', 'Sibling', 'Grandchild', 
  'Niece/Nephew', 'Friend', 'Charity', 'Trust', 'Other'
];

export default function BeneficiariesPage() {
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    percentage: 0,
  });

  // Load beneficiaries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('proveniq_beneficiaries');
    if (saved) {
      setBeneficiaries(JSON.parse(saved));
    }
  }, []);

  // Save beneficiaries to localStorage
  const saveBeneficiaries = (newList: Beneficiary[]) => {
    setBeneficiaries(newList);
    localStorage.setItem('proveniq_beneficiaries', JSON.stringify(newList));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', relationship: '', percentage: 0 });
    setEditingBeneficiary(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.relationship) {
      toast({ title: 'Error', description: 'Name and relationship are required.', variant: 'destructive' });
      return;
    }

    if (editingBeneficiary) {
      // Update existing
      const updated = beneficiaries.map(b => 
        b.id === editingBeneficiary.id 
          ? { ...b, ...formData }
          : b
      );
      saveBeneficiaries(updated);
      toast({ title: 'Beneficiary Updated', description: `${formData.name} has been updated.` });
    } else {
      // Add new
      const newBeneficiary: Beneficiary = {
        id: `ben_${Date.now()}`,
        ...formData,
      };
      saveBeneficiaries([...beneficiaries, newBeneficiary]);
      toast({ title: 'Beneficiary Added', description: `${formData.name} has been added.` });
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setFormData({
      name: beneficiary.name,
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      relationship: beneficiary.relationship,
      percentage: beneficiary.percentage || 0,
    });
    setEditingBeneficiary(beneficiary);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this beneficiary?')) {
      const updated = beneficiaries.filter(b => b.id !== id);
      saveBeneficiaries(updated);
      toast({ title: 'Beneficiary Removed', description: 'Beneficiary has been removed.' });
    }
  };

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);

  return (
    <>
      <div className="mb-4">
        <Link href="/legacy-planner" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Legacy Planner
        </Link>
      </div>

      <PageHeader
        title="Manage Beneficiaries"
        description="Add and manage the people or organizations who will inherit your items."
      />

      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">{beneficiaries.length}</p>
                <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${totalPercentage > 100 ? 'text-red-500' : totalPercentage === 100 ? 'text-green-500' : ''}`}>
                  {totalPercentage}%
                </p>
                <p className="text-sm text-muted-foreground">Total Allocation</p>
              </div>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Beneficiary
              </Button>
            </div>
            {totalPercentage > 100 && (
              <p className="text-sm text-red-500 mt-2">⚠️ Total allocation exceeds 100%</p>
            )}
          </CardContent>
        </Card>

        {/* Beneficiaries List */}
        {beneficiaries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Beneficiaries Yet</h3>
              <p className="text-muted-foreground mb-4">Add your first beneficiary to start planning your legacy.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Beneficiary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {beneficiaries.map(beneficiary => (
              <Card key={beneficiary.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{beneficiary.name}</h3>
                        <p className="text-sm text-muted-foreground">{beneficiary.relationship}</p>
                        {beneficiary.email && (
                          <p className="text-xs text-muted-foreground">{beneficiary.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {beneficiary.percentage !== undefined && beneficiary.percentage > 0 && (
                        <div className="text-right">
                          <p className="text-lg font-bold">{beneficiary.percentage}%</p>
                          <p className="text-xs text-muted-foreground">Allocation</p>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(beneficiary)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(beneficiary.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => { if (!open) resetForm(); setShowAddModal(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBeneficiary ? 'Edit Beneficiary' : 'Add Beneficiary'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship *</Label>
              <Select value={formData.relationship} onValueChange={(val) => setFormData(prev => ({ ...prev, relationship: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship..." />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allocation Percentage</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={(e) => setFormData(prev => ({ ...prev, percentage: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">What percentage of your estate should this beneficiary receive?</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowAddModal(false); }}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingBeneficiary ? 'Save Changes' : 'Add Beneficiary'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
