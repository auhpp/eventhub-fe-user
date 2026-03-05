import { AttendeeStatus } from "@/utils/constant";
import { Badge } from "./ui/badge";

const AttendeeStatusBadge = ({ status }) => {
    const statusStyle = AttendeeStatus[status];

    return (
        <Badge variant="outline" className={`px-2 py-0.5 text-xs
                                 font-bold bg-white border ${statusStyle.color} shadow-none`}>
            {statusStyle.label}
        </Badge>
    )

};

export default AttendeeStatusBadge