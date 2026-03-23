import { AttendeeStatus } from "@/utils/constant";
import { Badge } from "./ui/badge";

const AttendeeStatusBadge = ({ status }) => {
    const styles = {
        [AttendeeStatus.INACTIVE.key]: {
            color: "bg-yellow-100 text-yellow-700",
            label: "Chờ thanh toán"
        },
        [AttendeeStatus.VALID.key]: {
            color: "bg-gray-100 text-gray-700",
            label: "Chưa check-in"
        },
        [AttendeeStatus.CHECKED_IN.key]: {
            color: "bg-blue-100 text-blue-700",
            label: "Đã check-in"
        },
        [AttendeeStatus.CANCELLED_BY_EVENT.key]: {
            color: "bg-red-100 text-red-700",
            label: "Đã hủy bởi sự kiện"
        },
        [AttendeeStatus.CANCELLED_BY_USER.key]: {
            color: "bg-red-100 text-red-700",
            label: "Đã hủy bởi bạn",
        },
        [AttendeeStatus.ON_RESALE.key]: {
            color: "bg-orange-100 text-orange-700",
            label: "Đang bán"
        },
        [AttendeeStatus.RESOLD.key]: {
            color: "bg-green-100 text-green-700",
            label: "Đã bán lại"
        },
    };

    return <Badge variant="outline" className={styles[status].color} > {styles[status].label}</Badge>;


};

export default AttendeeStatusBadge