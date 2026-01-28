import { Badge } from "./ui/badge";

const InvitationStatusBadge = ({ status }) => {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
        ACCEPTED: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
        REJECTED: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
        EXPIRED: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200",
        REVOKED: "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200",

    };
    const labels = { PENDING: "Đang chờ", ACCEPTED: "Đã chấp nhận", REJECTED: "Từ chối", EXPIRED: "Hết hạn", REVOKED: 'Đã thu hồi' };
    return <Badge variant="outline" className={styles[status] || "bg-gray-100"}>{labels[status] || status}</Badge>;
};

export default InvitationStatusBadge;