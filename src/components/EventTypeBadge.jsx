import { EventType } from "@/utils/constant"
import { Badge } from "./ui/badge"

const EventTypeBadge = ({ type }) => {
    const isOnline = type == EventType.ONLINE.key
    return (
        <Badge
            variant="outline"
            className={`shrink-0 text-[10px] px-2 py-0.5 h-6 
                            ${isOnline
                    ? 'border-blue-200 text-blue-700 bg-blue-50'
                    : 'border-orange-200 text-orange-700 bg-orange-50'
                }`}
        >
            {isOnline ? 'Online' : 'Offline'}
        </Badge>
    )
}

export default EventTypeBadge