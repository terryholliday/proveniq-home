'use client';

import Image from "next/image";
import { ReactNode } from "react";
import { MyArkLogo } from "@/components/onboarding/MyArkLogo";

interface AuthPageFrameProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthPageFrame({ title, subtitle, children, footer }: AuthPageFrameProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="relative hidden lg:flex bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-400">
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, rgba(255,255,255,0) 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0) 30%), radial-gradient(circle at 50% 70%, rgba(255,255,255,0.2) 0, rgba(255,255,255,0) 35%)"
                    }} />
                    <div className="relative flex flex-col justify-between p-10 gap-6 text-white/90">
                        <div className="flex items-center gap-3 text-white/80">
                            <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                                <MyArkLogo size={36} />
                            </div>
                            <div className="text-sm uppercase tracking-[0.2em] font-semibold">Organize with MyArk</div>
                        </div>

                        <div className="relative w-full max-w-md mx-auto">
                            <div className="relative aspect-[4/3] w-full">
                                <Image
                                    src="/auth-illustration.svg"
                                    alt="Organize your home with MyArk"
                                    fill
                                    priority
                                    className="object-contain drop-shadow-2xl"
                                    sizes="(min-width: 1024px) 400px, 100vw"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl font-semibold leading-tight text-white">Less clutter, more clarity.</h2>
                            <p className="text-sm leading-relaxed text-indigo-50/90 max-w-md">
                                Keep your inventory, photos, and valuations together. Log in or create an account to pick up right where you left off.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-10">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <MyArkLogo size={48} className="mb-4" />
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center">{title}</h1>
                        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">{subtitle}</p>
                    </div>

                    {children}

                    {footer && (
                        <div className="mt-8 text-center text-sm text-gray-600">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
