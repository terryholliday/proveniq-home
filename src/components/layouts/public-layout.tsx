import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MyArkLogo } from "../onboarding/MyArkLogo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <MyArkLogo size={24} />
                        <span className="">MyARK</span>
                    </Link>
                    <nav className="ml-auto flex items-center gap-2">
                        <Link href="/login" passHref>
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/signup" passHref>
                            <Button>Sign Up</Button>
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t">
                <div className="container py-8 flex items-center justify-between text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} MyARK, Inc.</span>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:underline">Privacy Policy</Link>
                        <Link href="#" className="hover:underline">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
