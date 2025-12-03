'use client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider as AppleAuthProvider } from 'firebase/auth';
import { useUserProfile } from "@/hooks/use-user-profile";
import { useEffect } from "react";
import { initiateEmailSignIn } from "@/firebase";
import { Apple, Facebook, CaseSensitive } from "lucide-react";


export default function LoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const { createUserProfile } = useUserProfile(user);

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    const handleOAuthLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | AppleAuthProvider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            await createUserProfile(result.user);
            router.push('/dashboard');
        } catch (error) {
            console.error("OAuth sign-in error", error);
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

  return (
    <>
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-balance text-muted-foreground">
            Enter your email below to login to your account
        </p>
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                    >
                        Forgot your password?
                    </Link>
                </div>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" onClick={() => initiateEmailSignIn(auth, (document.getElementById('email') as HTMLInputElement).value, (document.getElementById('password') as HTMLInputElement).value)}>
                Login
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <CaseSensitive className="mr-2 h-4 w-4" />
                Login with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleFacebookLogin}>
                <Facebook className="mr-2 h-4 w-4" />
                Login with Facebook
            </Button>
            <Button variant="outline" className="w-full" onClick={handleAppleLogin}>
                <Apple className="mr-2 h-4 w-4" />
                Login with Apple
            </Button>
        </div>
        <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
                Sign up
            </Link>
        </div>
    </>
  )
}
