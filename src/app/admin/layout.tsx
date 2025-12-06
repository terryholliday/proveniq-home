'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ADMIN_AUTH_KEY = 'admin-authenticated';
const ADMIN_LOGIN_ROUTE = '/admin/login';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!pathname) return;

        if (pathname.startsWith(ADMIN_LOGIN_ROUTE)) {
            setIsAuthorized(true);
            return;
        }

        const hasAccess = typeof window !== 'undefined' && localStorage.getItem(ADMIN_AUTH_KEY) === 'true';

        if (!hasAccess) {
            setIsAuthorized(false);
            router.replace(ADMIN_LOGIN_ROUTE);
            return;
        }

        setIsAuthorized(true);
    }, [pathname, router]);

    if (!isAuthorized) return null;

    return <>{children}</>;
}
