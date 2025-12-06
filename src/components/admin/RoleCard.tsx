import { LeadershipRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Briefcase, Key } from "lucide-react";

interface RoleCardProps {
    role: LeadershipRole;
}

export function RoleCard({ role }: RoleCardProps) {
    const getStatusColor = (status: LeadershipRole['status']) => {
        switch (status) {
            case 'active': return 'default';
            case 'vacant': return 'destructive';
            case 'acting': return 'secondary';
            default: return 'outline';
        }
    };

    const getIcon = (category: LeadershipRole['category']) => {
        switch (category) {
            case 'compliance': return <Shield className="h-4 w-4" />;
            case 'executive': return <User className="h-4 w-4" />;
            case 'security': return <Key className="h-4 w-4" />;
            case 'operational': return <Briefcase className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    {getIcon(role.category)}
                    <CardTitle className="text-sm font-medium">
                        {role.title}
                    </CardTitle>
                </div>
                <Badge variant={getStatusColor(role.status)}>{role.status}</Badge>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-4 mt-2">
                    <Avatar>
                        <AvatarImage src={role.avatarUrl} />
                        <AvatarFallback>{role.assigneeName?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{role.assigneeName || 'Unassigned'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{role.category}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Responsibilities</h4>
                        <ul className="text-sm space-y-1">
                            {role.responsibilities.map((r, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Key Deliverables</h4>
                        <ul className="text-sm space-y-1">
                            {role.keyDeliverables.map((d, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span>{d}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
