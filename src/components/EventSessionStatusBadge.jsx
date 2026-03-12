import { Badge } from "@/components/ui/badge";
import { EventSessionStatus } from "@/utils/constant";
import { isExpiredEventSession } from "@/utils/eventUtils";

const EventSessionStatusBadge = ({ eventSession }) => {
    const isEventEnded = isExpiredEventSession({ endDateTime: eventSession.endDateTime })
    if (isEventEnded) {
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 ring-1 ring-gray-500/10 shadow-none">
            Đã kết thúc</Badge>;
    }
    switch (eventSession.status) {
        case EventSessionStatus.APPROVED:
            return <Badge className="bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-600/20 shadow-none">
                Đã được duyệt
            </Badge>;
        case EventSessionStatus.PENDING:
            return <Badge className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 ring-1 
                ring-yellow-600/20 shadow-none">Chờ duyệt</Badge>;
        case EventSessionStatus.CANCELLED:
            return <Badge className="bg-gray-100 text-red-600 hover:bg-red-200 ring-1 
                ring-red-500/10 shadow-none">
                Đã hủy</Badge>;
        case EventSessionStatus.REJECTED:
            return <Badge className="bg-gray-100 text-red-600 hover:bg-red-200 ring-1 
                ring-red-500/10 shadow-none">
                Đã bị từ chối</Badge>;
        default:
            return null;
    }
};

export default EventSessionStatusBadge;