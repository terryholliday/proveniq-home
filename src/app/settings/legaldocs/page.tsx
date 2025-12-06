'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TermsOfService,
  PrivacyPolicy,
  EULA,
  AIDisclosure,
  CookiePolicy,
  ArkiveAIDisclosure,
  ArkiveAuctionTerms,
} from '../legaldocs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DOCS = {
  privacy: { label: 'Privacy Policy', component: PrivacyPolicy },
  tos: { label: 'Terms of Service', component: TermsOfService },
  eula: { label: 'End User License Agreement', component: EULA },
  ai: { label: 'AI Services Disclosure', component: AIDisclosure },
  cookies: { label: 'Cookie & Tracking Technologies', component: CookiePolicy },
  arkive_ai: { label: 'myarkauctions AI Disclosure', component: ArkiveAIDisclosure },
  arkive_terms: { label: 'myarkauctions Terms', component: ArkiveAuctionTerms },
};

type DocKey = keyof typeof DOCS;

export default function LegalDocsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const docParam = searchParams.get('doc') as DocKey | null;
  const selectedDoc: DocKey = docParam && DOCS[docParam] ? docParam : 'privacy';
  const SelectedComponent = DOCS[selectedDoc].component;

  const handleBack = () => {
    router.push('/settings');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/settings" passHref>
          <Button variant="ghost" className="px-0">&larr; Back to Settings</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.entries(DOCS).map(([key, value]) => (
            <Link key={key} href={`/settings/legaldocs?doc=${key}`} passHref>
              <Button variant={selectedDoc === key ? 'default' : 'outline'}>{value.label}</Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      <SelectedComponent onBack={handleBack} />
    </div>
  );
}
