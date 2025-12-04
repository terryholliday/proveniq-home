'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to:
          </p>
          {email && <p className="font-semibold text-lg text-gray-800">{email}</p>}
          <p className="text-muted-foreground">
            Please click the link in that email to activate your account.
            If you don&apos;t see it, check your spam folder.
          </p>
          <Link href="/login" passHref>
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div>Loading email confirmation...</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
