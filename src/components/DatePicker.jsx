import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

const DatePicker = ({ value, onChange, error, label, require }) => {
    const dateValue = value ? new Date(value) : undefined;

    const handleDateSelect = (selectedDate) => {
        if (!selectedDate) return;

        const newDate = new Date(selectedDate);
        // Reset 
        newDate.setHours(0, 0, 0, 0);

        // format ISO 
        const dateString = format(newDate, "yyyy-MM-dd");
        onChange(dateString);
    };

    return (
        <div className="space-y-2">
            <Label className={cn("text-xs uppercase font-bold", error ? "text-red-500" : "text-muted-foreground")}>
                {label}
                {require && <span className="text-red-500"> *</span>}
            </Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal h-10 rounded-lg",
                            !value && "text-muted-foreground",
                            error && "border-red-500 text-red-500 focus:ring-red-500"
                        )}
                    >
                        {value ? (
                            format(dateValue, "dd/MM/yyyy", { locale: vi })
                        ) : (
                            <span>dd/mm/yyyy</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                        <Calendar
                            mode="single"
                            selected={dateValue}
                            onSelect={handleDateSelect}
                            initialFocus
                            locale={vi}
                        />
                    </div>
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-[0.8rem] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
};

export default DatePicker;