'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useUser } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider as AppleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Apple, Facebook, CaseSensitive, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { createUserProfile } = useUserProfile();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (auth) {
      getRedirectResult(auth)
        .then(async (result) => {
          if (!result) return;
          setIsLoading(true);
          await createUserProfile(result.user);
          router.push("/onboarding/permissions");
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : "Social login failed.";
          setError(message);
          setIsLoading(false);
        });
    }
  }, [auth, createUserProfile, router]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  const ensureAgreement = () => {
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service, Privacy Policy, and AI Disclosure.");
      return false;
    }
    setError("");
    return true;
  };

  const handleOAuthSignup = async (provider: GoogleAuthProvider | FacebookAuthProvider | AppleAuthProvider) => {
    if (!ensureAgreement()) return;
    setIsLoading(true);
    setError("");

    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Social login failed.";
      setError(message);
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const firstName = (document.getElementById("first-name") as HTMLInputElement).value;
    const lastName = (document.getElementById("last-name") as HTMLInputElement).value;

    if (!email || !password || !firstName || !lastName) {
      setError("Please fill out all fields.");
      return;
    }

    if (!ensureAgreement()) return;

    setIsLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user, { firstName, lastName });
      router.push("/onboarding/permissions");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create account.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => handleOAuthSignup(new GoogleAuthProvider());
  const handleFacebookSignup = () => handleOAuthSignup(new FacebookAuthProvider());
  const handleAppleSignup = () => handleOAuthSignup(new AppleAuthProvider("apple.com"));

  return (
    <>
      <h1 className="text-3xl font-bold">Create an account</h1>
      <p className="text-balance text-muted-foreground">Enter your information to create an account</p>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100" role="alert">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" placeholder="Max" required disabled={isLoading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" placeholder="Robinson" required disabled={isLoading} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" disabled={isLoading} />
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{" "}
            <Link href="/settings/legaldocs?doc=tos" className="underline underline-offset-4 hover:text-primary" target="_blank">
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/settings/legaldocs?doc=privacy" className="underline underline-offset-4 hover:text-primary" target="_blank">
              Privacy Policy
            </Link>{" "}
            , and{" "}
            <Link href="/settings/legaldocs?doc=ai" className="underline underline-offset-4 hover:text-primary" target="_blank">
              AI Disclosure
            </Link>
            .
          </label>
        </div>

        <Button type="submit" className="w-full" onClick={handleEmailSignup} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Create an account"}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={isLoading}>
          <CaseSensitive className="mr-2 h-4 w-4" />
          Sign up with Google
        </Button>
        <Button variant="outline" className="w-full" onClick={handleFacebookSignup} disabled={isLoading}>
          <Facebook className="mr-2 h-4 w-4" />
          Sign up with Facebook
        </Button>
        <Button variant="outline" className="w-full" onClick={handleAppleSignup} disabled={isLoading}>
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
  );
}
