import { AttendeeStatus } from "./constant";
import { isExpiredEventSession } from "./eventUtils";

export const isAttendeeUnusable = ({ attendee }) => {
    const isEventExpired = isExpiredEventSession({ eventSession: attendee.eventSession }); 
    const isCheckedIn = attendee.status === AttendeeStatus.CHECKED_IN.key; 

    const isCancelled = attendee.status === AttendeeStatus.CANCELLED_BY_EVENT.key ||
        attendee.status === AttendeeStatus.CANCELLED_BY_USER.key; 

    return isEventExpired || isCancelled || isCheckedIn;
}