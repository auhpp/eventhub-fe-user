import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { vi } from 'date-fns/locale';

const WeekPicker = ({ onChange }) => {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 font-medium bg-gray-50 text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2 opacity-50" /> Tuần
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
                <div className="mb-2 text-sm font-semibold text-center text-muted-foreground">
                    Chọn một ngày trong tuần
                </div>
                <Calendar
                    mode="single"
                    locale={vi}
                    onSelect={(date) => {
                        if (date) {
                            onChange(date); 
                            setOpen(false);
                        }
                    }}
                />
            </PopoverContent>
        </Popover>
    );
};

export default WeekPicker