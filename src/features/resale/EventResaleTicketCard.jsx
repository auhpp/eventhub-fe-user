import ResalePostHasRetailBadge from "@/components/ResalePostHasRetailBadge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { AuthContext } from "@/context/AuthContex";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";
import { Calendar } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const EventResaleTicketCard = ({ post, event }) => {
    const navigate = useNavigate();
    const firstAttendee = post.attendees?.[0];
    const ticketInfo = firstAttendee?.ticket;
    const sessionInfo = event?.eventSessions?.find(s => s.id === ticketInfo?.eventSessionId);

    const quantity = post.attendees?.length || 0;
    const { user } = useContext(AuthContext)

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex 
        flex-col relative overflow-hidden">
            {/* Header card */}
            <div className="p-4 bg-slate-50 border-b border-dashed border-slate-200 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${post.hasRetail ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                        <h3 className="font-bold text-slate-800 line-clamp-1" title={ticketInfo?.name}>
                            {ticketInfo?.name}
                        </h3>
                    </div>
                    <ResalePostHasRetailBadge hasRetail={post.hasRetail} />
                </div>
                <div className="text-right">
                    <span className="text-xs font-medium text-slate-600">Số lượng: <strong className="text-slate-900 text-sm">
                        {quantity}</strong></span>
                </div>
            </div>

            {/* session time */}
            <div className="p-4 flex-1 flex flex-col justify-center space-y-3">
                <div className="flex gap-3 items-start">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <p className="font-medium text-slate-700">{sessionInfo ? formatTime(sessionInfo.startDateTime) : "--:--"}</p>
                        <p className="text-slate-500">{sessionInfo ? formatDate(sessionInfo.startDateTime) : "Đang cập nhật"}</p>
                    </div>
                </div>
            </div>

            {/* Footer price and button */}
            <div className="p-4 pt-0 mt-auto flex items-end justify-between">
                <div>
                    <p className="text-xs text-slate-500 mb-0.5">Giá bán mỗi vé:</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(post.pricePerTicket)}</p>
                </div>
                <Button
                    onClick={() => {
                        if (user.id != post.appUser.id) {
                            navigate(routes.attendeeSelection.replace(":eventId", event.id).replace(":resalePostId", post.id))
                        }
                        else {
                            navigate(routes.resaleDetailProfile.replace(":id", post.id))
                        }

                    }}
                    size="sm"
                    className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg px-4"
                >
                    {user.id != post.appUser.id ? 'Mua ngay' : "Xem chi tiết"}
                </Button>
            </div>
        </div>
    );
};

export default EventResaleTicketCard