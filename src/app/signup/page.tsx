'use client';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider as AppleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { useUserProfile } from "@/hooks/use-user-profile";
import { useEffect } from "react";
import { initiateEmailSignUp } from "@/firebase";
import { Apple, Facebook, CaseSensitive } from "lucide-react";


export default function SignupPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const { createUserProfile } = useUserProfile(user);

    useEffect(() => {
        // We no longer redirect to dashboard here.
        // The individual signup handlers will redirect.
    }, [user, isUserLoading, router]);

    const handleSignupSuccess = (newUser: any) => {
        // After profile is created, go to the permissions screen
        router.push('/onboarding/permissions');
    }

    const handleOAuthSignup = async (provider: GoogleAuthProvider | FacebookAuthProvider | AppleAuthProvider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            await createUserProfile(result.user);
            handleSignupSuccess(result.user);
        } catch (error) {
            console.error("OAuth sign-up error", error);
        }
    };
    
    const handleEmailSignup = async () => {
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(userCredential.user);
            handleSignupSuccess(userCredential.user);
        } catch (error) {
            console.error("Email sign-up error", error);
        }
    }

    const handleGoogleSignup = () => {
        const provider = new GoogleAuthProvider();
        handleOAuthSignup(provider);
    };

    const handleFacebookSignup = () => {
        const provider = new FacebookAuthProvider();
        handleOAuthSignup(provider);
    };

    const handleAppleSignup = () => {
        const provider = new AppleAuthProvider('apple.com');
        handleOAuthSignup(provider);
    };

  return (
    <>
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-balance text-muted-foreground">
            Enter your information to create an account
        </p>
        <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Max" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Robinson" required />
                </div>
            </div>
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
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full" onClick={handleEmailSignup}>
                Create an account
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
            <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
                <CaseSensitive className="mr-2 h-4 w-4" />
                Sign up with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleFacebookSignup}>
                <Facebook className="mr-2 h-4 w-4" />
                Sign up with Facebook
            </Button>
            <Button variant="outline" className="w-full" onClick={handleAppleSignup}>
                <Apple className="mr-2 h-4 w-4" />
                Sign up with Apple
            </Button>
        </div>
        <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
                Login
            </Link>
        </div>
    </>
  )
}
