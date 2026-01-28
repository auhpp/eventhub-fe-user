import { Crown, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { AttendeeType } from "@/utils/constant";

const AttendeeTypeBadges = ({ bookings }) => {
    const uniqueTypes = new Set();

    bookings?.forEach(booking => {
        booking.attendees?.forEach(attendee => {
            if (attendee.type) uniqueTypes.add(attendee.type);
        });
    });

    const typesArray = Array.from(uniqueTypes);

    if (typesArray.length === 0) return <span className="text-muted-foreground text-xs">-</span>;

    return (
        <div className="flex flex-wrap gap-1">
            {typesArray.map(type => {
                if (type === AttendeeType.INVITE) {
                    return (
                        <Badge key="invited" variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1 px-2">
                            <Crown size={10} className="fill-purple-700/20" /> Khách mời
                        </Badge>
                    );
                }
                if (type === AttendeeType.BUY) {
                    return (
                        <Badge key="buyer" variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 px-2">
                            <User size={10} /> Người mua
                        </Badge>
                    );
                }
                return null;
            })}
        </div>
    );
};

export default AttendeeTypeBadges