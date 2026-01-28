import { Badge } from "./ui/badge";

const AttendeeStatusBadge = ({ status }) => {
    const styles = {
        CHECKED_IN: "bg-blue-100 text-blue-700 border-blue-200",
        IDLE: "bg-gray-100 text-gray-600 border-gray-200",
    };
    const labels = { CHECKED_IN: "Đã Check-in", IDLE: "Chưa Check-in" };
    return <Badge variant="outline" className={styles[status] || styles.IDLE}>{labels[status] || "Chưa Check-in"}</Badge>;
};

export default AttendeeStatusBadge