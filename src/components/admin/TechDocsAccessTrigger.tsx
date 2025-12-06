'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function TechDocsAccessTrigger({ children }: { children: React.ReactNode }) {
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
        // We do typically want to allow default if it's a link, but counting clicks on a link might navigate away before 5 clicks.
        // However, user usually stays on page if it's "Privacy Policy" and it opens? Or maybe we just prevent default on the 5th click?
        // Let's prevent default on 5th click.

        const newCount = clicks + 1;
        setClicks(newCount);

        if (newCount >= 5) {
            e.preventDefault(); // Stop normal link behavior or text selection
            console.log("Tech Docs Access Triggered");
            router.push('/tech-docs');
            setClicks(0);
        }
    };

    return (
        <span
            onClick={handleClick}
            className="cursor-default select-none"
        // role="button" // removed role button to not interfere with screen readers if wrapping a link excessively, though span is generic
        // tabIndex={0}
        >
            {children}
        </span>
    );
}
