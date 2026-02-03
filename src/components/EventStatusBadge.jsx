import { Badge } from "@/components/ui/badge";
import { EventStatus } from "@/utils/constant";

const EventStatusBadge = ({ eventSessions, status }) => {
    const isEventEnded = eventSessions.every((it) => new Date(it.endDateTime) < new Date())
    if (isEventEnded) {
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 ring-1 ring-gray-500/10 shadow-none">
            Đã kết thúc</Badge>;
    }
    switch (status) {
        case EventStatus.APPROVED:
            return <Badge className="bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-600/20 shadow-none">
                Đã được duyệt
            </Badge>;
        case EventStatus.PENDING:
            return <Badge className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 ring-1 
            ring-yellow-600/20 shadow-none">Chờ duyệt</Badge>;
        case EventStatus.CANCELLED:
            return <Badge className="bg-gray-100 text-red-600 hover:bg-red-200 ring-1 
            ring-red-500/10 shadow-none">
                Đã hủy</Badge>;
        case EventStatus.REJECTED:
            return <Badge className="bg-gray-100 text-red-600 hover:bg-red-200 ring-1 
            ring-red-500/10 shadow-none">
                Đã bị từ chối</Badge>;
        default:
            return null;
    }
};

export default EventStatusBadge;