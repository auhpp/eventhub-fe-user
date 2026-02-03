import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

const DateTimePicker = ({ value, onChange, error, label, require }) => {
    const dateValue = value ? new Date(value) : undefined;

    const handleDateSelect = (selectedDate) => {
        if (!selectedDate) return;

        const newDate = new Date(selectedDate);
        newDate.setHours(0, 0, 0, 0);

        const isoString = format(newDate, "yyyy-MM-dd'T'HH:mm");
        onChange(isoString);
    };

    const handleTimeChange = (e) => {
        const timeStr = e.target.value; // HH:mm
        if (!dateValue) return;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const newDate = new Date(dateValue);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);

        const isoString = format(newDate, "yyyy-MM-dd'T'HH:mm");
        onChange(isoString);
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
                            // Format display dd/MM/yyyy - HH:mm
                            format(dateValue, "dd/MM/yyyy - HH:mm", { locale: vi })
                        ) : (
                            <span>dd/mm/yyyy - 00:00</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b border-border">
                        <Calendar
                            mode="single"
                            selected={dateValue}
                            onSelect={handleDateSelect}
                            initialFocus
                            locale={vi}
                        />
                    </div>
                    {/* change time session */}
                    <div className="p-3 flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Giờ:</span>
                        <input
                            type="time"
                            className="border rounded px-2 py-1 text-sm focus:outline-blue-500"
                            value={value ? format(dateValue, "HH:mm") : "00:00"}
                            onChange={handleTimeChange}
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

export default DateTimePicker