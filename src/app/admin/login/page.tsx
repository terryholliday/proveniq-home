'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ADMIN_PASSWORD = 'Proveniq Home-123$abc';
const ADMIN_AUTH_KEY = 'admin-authenticated';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password === ADMIN_PASSWORD) {
            localStorage.setItem(ADMIN_AUTH_KEY, 'true');
            setError('');
            router.replace('/admin');
            return;
        }

        setError('Incorrect password. Please try again.');
        setPassword('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                        <LockKeyhole className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Admin Access</h1>
                        <p className="text-sm text-muted-foreground">Enter the admin password to continue.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">Password</label>
                        <Input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter admin password"
                            required
                            autoFocus
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full">
                        Enter Admin Dashboard
                    </Button>
                </form>
            </div>
        </div>
    );
}
