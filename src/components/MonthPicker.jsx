import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Label } from './ui/label';

const MonthPicker = ({ value, onChange, label }) => {
    const [open, setOpen] = useState(false);
    const dateValue = value ? new Date(value) : null;
    const [year, setYear] = useState(dateValue ? dateValue.getFullYear() : new Date().getFullYear());

    const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

    return (
        <div className="space-y-2 w-full">
            {label && <Label className="text-xs font-bold uppercase text-muted-foreground">{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal h-10 rounded-lg", !value && "text-muted-foreground")}
                    >
                        {value ? format(dateValue, "MM/yyyy") : <span>Chọn tháng...</span>}
                        <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-3" align="start">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="icon" onClick={() => setYear(year - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="text-sm font-bold">{year}</div>
                        <Button variant="ghost" size="icon" onClick={() => setYear(year + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((m, i) => (
                            <Button
                                key={i}
                                variant={dateValue && dateValue.getMonth() === i && dateValue.getFullYear() === year ?
                                    "default" : "ghost"}
                                className="text-sm font-normal"
                                onClick={() => {
                                    onChange(new Date(year, i, 1));
                                    setOpen(false);
                                }}
                            >
                                {m}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default MonthPicker