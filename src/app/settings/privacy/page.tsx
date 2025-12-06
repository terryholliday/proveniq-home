'use client';

import Link from 'next/link';
import { PrivacyPolicy } from '../legaldocs';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/settings" passHref>
          <Button variant="ghost" className="px-0">&larr; Back to Settings</Button>
        </Link>
      </div>
      <PrivacyPolicy onBack={() => {}} />
    </div>
  );
}
