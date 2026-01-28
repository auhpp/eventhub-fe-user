import { Badge } from "./ui/badge";

const BookingStatusBadge = ({ status }) => {
    const styles = {
        PAID: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
        CANCELLED: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
    };
    const labels = { PAID: "Đã thanh toán", CANCELLED: "Đã hủy", PENDING: "Chờ thanh toán" };
    return <Badge variant="outline" className={styles[status]}>{labels[status] || status}</Badge>;
};

export default BookingStatusBadge;