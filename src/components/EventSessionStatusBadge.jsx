import { Badge } from "@/components/ui/badge";
import { isExpiredEventSession } from "@/utils/eventUtils";

const EventSessionStatusBadge = ({ eventSession }) => {
    const isEventEnded = isExpiredEventSession({ eventSession: eventSession })
    if (isEventEnded) {
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 ring-1 ring-gray-500/10 shadow-none">
            Đã kết thúc</Badge>;
    }
};

export default EventSessionStatusBadge;