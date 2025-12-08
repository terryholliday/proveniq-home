'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@/firebase";
import {
    getRedirectResult,
    signInWithRedirect,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider as AppleAuthProvider
} from "firebase/auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { initiateEmailSignIn } from "@/firebase";
import { Loader2 } from "lucide-react";
import { MyArkLogo } from "@/components/onboarding/MyArkLogo";

// --- Social Icons ---
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.648 0-2.928 1.67-2.928 3.403v1.518h3.949l-.542 3.667h-3.407v7.98H9.101Z" />
    </svg>
);

const AppleIcon = () => (
    <svg className="w-5 h-5 text-black fill-current" viewBox="0 0 24 24">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.675-.548 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.415-2.376-2.003-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const { createUserProfile } = useUserProfile(user);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showDemoOption, setShowDemoOption] = useState(false);

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    // Handle Redirect Result
    useEffect(() => {
        if (auth) {
            getRedirectResult(auth)
                .then(async (result) => {
                    if (!result) return;
                    setIsLoading(true);
                    await createUserProfile(result.user);
                    router.push('/dashboard');
                })
                .catch((err) => {
                    const message = err instanceof Error ? err.message : "Social login failed.";
                    setError(message);
                    setIsLoading(false);
                });
        }
    }, [auth, createUserProfile, router]);


    const handleOAuthLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | AppleAuthProvider) => {
        setIsLoading(true);
        setError("");
        try {
            await signInWithRedirect(auth, provider);
        } catch (error: any) {
            const message = error instanceof Error ? error.message : "OAuth sign-in error";
            setError(message);
            setIsLoading(false);
            if (error?.code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
                setShowDemoOption(true);
            }
        }
    };

    const handleGoogleLogin = () => {
        const provider = new GoogleAuthProvider();
        handleOAuthLogin(provider);
    };

    const handleFacebookLogin = () => {
        const provider = new FacebookAuthProvider();
        handleOAuthLogin(provider);
    };

    const handleAppleLogin = () => {
        const provider = new AppleAuthProvider('apple.com');
        handleOAuthLogin(provider);
    };

    const handleEmailLogin = async () => {
        setIsLoading(true);
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        setError("");

        try {
            await initiateEmailSignIn(auth, email, password);
            // initiateEmailSignIn handles its own navigation/success usually or throws
        } catch (e: any) {
            console.error(e);
            const message = e instanceof Error ? e.message : "Login failed.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDemoLogin = () => {
        const mockUser = {
            uid: 'demo-user-' + Date.now(),
            email: 'demo@example.com',
            displayName: 'Demo User',
            emailVerified: true,
            isAnonymous: false,
            providerData: [],
        };
        sessionStorage.setItem('__MOCK_USER__', JSON.stringify(mockUser));
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
                <div className="flex flex-col items-center justify-center mb-6">
                    <MyArkLogo size={48} className="mb-4" />
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground mt-2">Enter your email and password to sign in</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 mb-4 font-medium" role="alert">
                        {error}
                        {showDemoOption && (
                            <div className="mt-3 pt-3 border-t border-red-200">
                                <p className="mb-2 text-xs text-red-800"> This domain is not authorized in Firebase. Use Demo Mode to continue locally.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDemoLogin}
                                    className="w-full border-red-200 hover:bg-red-50 text-red-700 bg-white"
                                >
                                    Enable Demo Mode (Bypass Auth)
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase text-gray-700">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            className="bg-white"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-bold uppercase text-gray-700">Password</Label>
                            <Link
                                href="#"
                                className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input id="password" type="password" required className="bg-white" disabled={isLoading} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-200 mt-2"
                        onClick={handleEmailLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </Button>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" className="h-11 rounded-xl bg-white hover:bg-gray-50 border-gray-200" onClick={handleGoogleLogin} disabled={isLoading}>
                            <GoogleIcon />
                        </Button>
                        <Button variant="outline" className="h-11 rounded-xl bg-white hover:bg-gray-50 border-gray-200" onClick={handleFacebookLogin} disabled={isLoading}>
                            <FacebookIcon />
                        </Button>
                        <Button variant="outline" className="h-11 rounded-xl bg-white hover:bg-gray-50 border-gray-200" onClick={handleAppleLogin} disabled={isLoading}>
                            <AppleIcon />
                        </Button>
                        <Button variant="outline" className="h-11 rounded-xl bg-white hover:bg-gray-50 border-gray-200" onClick={() => {
                            // Import dynamically or use the imported function if available
                            import('@/firebase/non-blocking-login').then(mod => {
                                // mod.signInWithPasskey(auth);
                                alert("Biometric sign-in initiated (stub).");
                            });
                        }} disabled={isLoading} title="Sign in with Biometrics">
                            <svg className="w-5 h-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M17.29 21.02c.12-.6.41-2.3.41-3.02 0-5.5-4.5-10-10-10S2 12.5 2 18" /><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4" /><path d="M10 12a14.7 14.7 0 0 0-1.4 8.7" /><path d="M14 12c.5 1 1 2.5 1 5a13.6 13.6 0 0 1-.7 3.3" /></svg>
                        </Button>
                    </div>
                </div>
                <div className="mt-8 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-bold text-indigo-600 hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    )
}
