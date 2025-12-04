
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode, checkActionCode, Auth } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import AuthWrapper from '@/components/layouts/auth-wrapper';

function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState('');
  
  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');

  useEffect(() => {
    if (mode !== 'verifyEmail' || !actionCode || !auth) {
      setError('Invalid verification link. Please try signing up again.');
      setStatus('error');
      return;
    }

    const handleVerifyEmail = async (auth: Auth, actionCode: string) => {
      try {
        // You can check the action code to get user email, etc. before applying.
        await checkActionCode(auth, actionCode);

        // Apply the action code to verify the email.
        await applyActionCode(auth, actionCode);

        setStatus('success');

        // Redirect to onboarding after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (e: unknown) {
        console.error(e);
        const errorCode =
          typeof e === 'object' && e && 'code' in e && typeof (e as { code?: unknown }).code === 'string'
            ? (e as { code: string }).code
            : null;
        if (errorCode === 'auth/invalid-action-code') {
          setError('This verification link has expired or is invalid. Please sign up again to get a new link.');
        } else {
          const message = e instanceof Error && e.message ? e.message : 'An unknown error occurred.';
          setError(message);
        }
        setStatus('error');
      }
    };

    handleVerifyEmail(auth, actionCode);
  }, [mode, actionCode, auth, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {status === 'loading' && <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />}
        {status === 'error' && <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />}
        {status === 'success' && <CheckCircle className="w-12 h-12 mx-auto text-green-500" />}
      </CardHeader>
      <CardContent className="text-center">
        {status === 'loading' && (
          <CardTitle>Verifying your email...</CardTitle>
        )}
        {status === 'error' && (
          <>
            <CardTitle>Verification Failed</CardTitle>
            <CardDescription className="mt-2 text-destructive">{error}</CardDescription>
          </>
        )}
        {status === 'success' && (
          <>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription className="mt-2">
              You will be redirected to the app shortly.
            </CardDescription>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Wrap with Suspense for useSearchParams
export default function VerifyEmailPage() {
  return (
    <AuthWrapper>
      <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin" />}>
        <VerifyEmail />
      </Suspense>
    </AuthWrapper>
  );
}
