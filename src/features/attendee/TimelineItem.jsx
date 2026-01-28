import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/format";

// eslint-disable-next-line no-unused-vars
const TimelineItem = ({ icon: Icon, colorClass, title, time, description, isLast }) => (
    <div className="flex gap-4 relative pb-8 last:pb-0">
        {/* Line Connector */}
        {!isLast && (
            <div className="absolute left-[19px] top-8 bottom-0 w-[2px] bg-muted" />
        )}

        {/* Icon */}
        <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm", colorClass)}>
            <Icon size={18} />
        </div>

        {/* Content */}
        <div className="flex flex-col pt-1 gap-1">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{title}</span>
                {time && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {formatDateTime(time)}</span>}
            </div>
            {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
    </div>
);

export default TimelineItem