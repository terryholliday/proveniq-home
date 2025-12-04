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

export default function LegacyPlannerPage() {
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <LegacyWizard />
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Own Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Document Name" />
                <Select defaultValue="will">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="will">Last Will & Testament</SelectItem>
                    <SelectItem value="trust">Living Trust</SelectItem>
                    <SelectItem value="poa">Power of Attorney</SelectItem>
                    <SelectItem value="other">Other Document</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="file" />
                <Button className="w-full" variant="secondary">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Need Professional Review?</h4>
                  <Button variant="outline" className="w-full">
                    <Scale className="mr-2 h-4 w-4" />
                    Request Attorney Review ($99)
                  </Button>
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
            Assigned by Beneficiary
          </h2>
          <Card className="flex items-center justify-center p-12 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground">
                No items have been assigned yet.{' '}
                <Link href="#" className="text-primary underline">
                  Add a beneficiary to get started.
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
