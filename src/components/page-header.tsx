import type { ReactNode } from "react";
import { Button } from "./ui/button";

type PageHeaderProps = {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4 mb-6">
            <div className="grid gap-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
