import { Badge } from "./ui/badge";

const VoucherStatusBadge = ({ start, end }) => {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now < startTime) {
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Sắp diễn ra</Badge>;
    } else if (now >= startTime && now <= endTime) {
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Đang diễn ra</Badge>;
    } else {
        return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Đã kết thúc</Badge>;
    }
};

export default VoucherStatusBadge;