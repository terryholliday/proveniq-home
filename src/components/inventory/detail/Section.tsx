'use client';

import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";

interface SectionProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    isEditing?: boolean;
    onEditToggle?: (isEditing: boolean) => void;
    onSave?: () => void;
    showEditButton?: boolean;
}

export function Section({ title, icon, children, isEditing, onEditToggle, onSave, showEditButton = true }: SectionProps) {
    return (
        <section className="py-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
                {onEditToggle && showEditButton && (
                    <div className="flex items-center gap-1">
                         {isEditing && onSave && (
                            <Button variant="ghost" size="icon" onClick={onSave} className="h-8 w-8 text-green-600 hover:text-green-700">
                                <Save className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => onEditToggle(!isEditing)} className="h-8 w-8">
                            {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                        </Button>
                    </div>
                )}
            </div>
            <div>{children}</div>
        </section>
    );
}

interface FieldProps {
    label: string;
    children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
    return (
        <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    );
}