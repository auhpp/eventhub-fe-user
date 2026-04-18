import { BookingType } from "@/utils/constant";
import { Badge } from "./ui/badge";

const BookingTypeBadge = ({ type }) => {
    const styles = {
        [BookingType.BUY]: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
        [BookingType.RESALE]: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
    };
    const labels = { [BookingType.BUY]: "Mua vé thường", [BookingType.RESALE]: "Mua lại vé" };
    return <Badge variant="outline" className={styles[type]}>{labels[type] || type}</Badge>;
};

export default BookingTypeBadge;