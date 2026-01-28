import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import { formatDay, formatTime } from '@/utils/format';

const SessionSelector = ({ sessions, selectedSessionId, onSelect }) => {
    if (!sessions || sessions.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <CalendarDays size={16} /> Chọn ngày diễn ra sự kiện
            </h3>
            <div className="flex flex-wrap gap-2">
                {sessions.map((session) => {
                    const isActive = String(session.id) === String(selectedSessionId);
                    const dateStr = formatDay(session.startDateTime)
                    const timeStr = formatTime(session.startDateTime)
                    return (
                        <Button
                            key={session.id}
                            variant={isActive ? "default" : "outline"}
                            className={cn(
                                "h-auto py-2 px-4 flex flex-col items-start gap-1 border-2",
                                isActive ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                                    : "border-transparent bg-card hover:bg-accent"
                            )}
                            onClick={() => onSelect(session.id)}
                        >
                            <span className="font-bold">{session.name}</span>
                            <span className="text-xs opacity-80 font-normal">{dateStr} - {timeStr}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default SessionSelector;