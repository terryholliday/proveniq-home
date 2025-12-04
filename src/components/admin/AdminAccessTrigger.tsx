'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function AdminAccessTrigger({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [clicks, setClicks] = useState(0);

    useEffect(() => {
        if (clicks === 0) return;

        const timer = setTimeout(() => {
            setClicks(0);
        }, 2000); // Reset after 2 seconds of inactivity

        return () => clearTimeout(timer);
    }, [clicks]);

    const handleClick = (e: React.MouseEvent) => {
        // Prevent default selection behavior if user clicks rapidly
        e.preventDefault();

        const newCount = clicks + 1;
        setClicks(newCount);

        if (newCount >= 5) {
            console.log("Admin Access Triggered");
            router.push('/admin/compliance');
            setClicks(0);
        }
    };

    return (
        <span
            onClick={handleClick}
            className="cursor-default select-none"
            role="button"
            tabIndex={0}
        >
            {children}
        </span>
    );
}
