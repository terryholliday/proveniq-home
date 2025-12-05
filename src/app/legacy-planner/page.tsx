'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Gift,
  FileText,
  Users,
  FileUp,
  Sparkles,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { LegacyWizard } from '@/components/legacy/LegacyWizard';


const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
}) => {
  const Icon = icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

import { useEffect } from 'react';
import { logPlannerStarted } from '@/lib/analytics';

export default function LegacyPlannerPage() {
  useEffect(() => {
    logPlannerStarted();
  }, []);

  return (
    <>
      <PageHeader
        title="Legacy Planner"
        description="Preserve your story and manage your inheritance."
      />

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Legacy Value"
            value="$0"
            icon={DollarSign}
          />
          <StatCard title="Items Assigned" value="0" icon={Gift} />
          <StatCard title="Recorded Stories" value="0" icon={FileText} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button variant="outline" size="lg">
            <Users className="mr-2 h-5 w-5" />
            Manage Beneficiaries
          </Button>
          <Button variant="outline" size="lg">
            <FileText className="mr-2 h-5 w-5" />
            Generate Full Report
          </Button>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            Legacy Documents <Sparkles className="h-5 w-5 text-yellow-500" />
          </h2>
          <Alert variant="destructive" className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-500">
            <AlertTriangle />
            <AlertTitle>Legal Disclaimer</AlertTitle>
            <AlertDescription>
              This is a secure vault for your important documents. It is not a
              substitute for legal advice or a legally executed will. Consult a
              qualified attorney for estate planning.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 gap-8">
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-primary" />
                  Upload Legacy Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Type</label>
                  <Select defaultValue="will">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="will">Last Will & Testament</SelectItem>
                      <SelectItem value="trust">Living Trust</SelectItem>
                      <SelectItem value="poa">Power of Attorney</SelectItem>
                      <SelectItem value="health">Advance Healthcare Directive</SelectItem>
                      <SelectItem value="other">Other Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the type of legal document you are storing.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Name</label>
                  <Input placeholder="e.g., My Last Will 2024" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">File Upload</label>
                  <Input type="file" className="cursor-pointer" />
                </div>

                <Button className="w-full" size="lg">
                  <FileUp className="mr-2 h-4 w-4" />
                  Securely Upload to Vault
                </Button>

                <div className="pt-6 border-t mt-6">
                  <div className="rounded-lg bg-slate-50 p-4 flex items-start gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Professional Review Available</h4>
                      <p className="text-sm text-muted-foreground">
                        Need an attorney to review your documents? Request a professional review starting at $99.
                      </p>
                      <Button variant="link" className="p-0 h-auto font-semibold text-primary">
                        Request Attorney Review &rarr;
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            No legal documents uploaded yet.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Create New Legacy Document
          </h2>
          <LegacyWizard />
        </div>
      </div>
    </>
  );
}
