import { ResalePostStatus } from "@/utils/constant";
import { Badge } from "./ui/badge";

const ResalePostStatusBadge = ({ status }) => {
    const styles = {
        [ResalePostStatus.PENDING]: {
            color: "bg-orange-100 text-orange-700",
            label: "Chờ duyệt"
        },
        [ResalePostStatus.APPROVED]: {
            color: "bg-blue-100 text-blue-700 ",
            label: "Đang đăng bán"
        },
        [ResalePostStatus.SOLD]: {
            color: "bg-green-100 text-green-700",
            label: "Đã bán"
        },
        [ResalePostStatus.REJECTED]: {
            color: "bg-red-100 text-red-700",
            label: "Đã bị từ chối"
        },
        [ResalePostStatus.CANCELLED_BY_USER]: {
            color: "bg-slate-100 text-slate-700",
            label: "Đã hủy bởi bạn",
        },
        [ResalePostStatus.CANCELLED_BY_ADMIN]: {
            color: "bg-slate-100 text-slate-700",
            label: "Đã hủy bởi hệ thống"
        },

    };
    return <Badge variant="outline" className={styles[status].color}>{styles[status].label}</Badge>;
};

export default ResalePostStatusBadge;