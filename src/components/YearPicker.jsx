import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

const YearPicker = ({ value, onChange, label }) => {
    const [open, setOpen] = useState(false);
    const dateValue = value ? new Date(value) : null;
    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState(dateValue ? dateValue.getFullYear() - 4 : currentYear - 4);

    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
        <div className="space-y-2 w-full">
            {label && <Label className="text-xs font-bold uppercase text-muted-foreground">{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal h-10 rounded-lg", !value && "text-muted-foreground")}
                    >
                        {value ? format(dateValue, "yyyy") : <span>Chọn năm...</span>}
                        <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-3" align="start">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="icon" onClick={() => setStartYear(startYear - 12)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="text-sm font-bold">{startYear} - {startYear + 11}</div>
                        <Button variant="ghost" size="icon" onClick={() => setStartYear(startYear + 12)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {years.map((y) => (
                            <Button
                                key={y}
                                variant={dateValue && dateValue.getFullYear() === y ? "default" : "ghost"}
                                className="text-sm font-normal"
                                onClick={() => {
                                    onChange(new Date(y, 0, 1));
                                    setOpen(false);
                                }}
                            >
                                {y}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default YearPicker