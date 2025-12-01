import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, DollarSign, HeartHandshake, MapPin, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

const iconMap: Record<string, ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
    archive: Archive,
    "dollar-sign": DollarSign,
    "heart-handshake": HeartHandshake,
    "map-pin": MapPin,
}

type StatCardProps = {
    title: string;
    value: string | number;
    icon: string;
};

export function StatCard({ title, value, icon }: StatCardProps) {
    const Icon = iconMap[icon];
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
