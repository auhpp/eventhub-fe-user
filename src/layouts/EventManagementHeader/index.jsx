import React, { useContext, useState } from "react";
import { Bell, Loader2, Ban } from "lucide-react";
import { AuthContext } from "@/context/AuthContex";
import { EventContext } from "@/context/EventContext";
import EventStatusBadge from "@/components/EventStatusBadge";
import { cancelEvent } from "@/services/eventService";
import { HttpStatusCode } from "axios";
import { toast } from "sonner";
import { ConfirmCancelModal } from "@/components/ConfirmCancelModal";
import { EventStatus, RoleName } from "@/utils/constant";

const EventMangementHeader = () => {
    const { user, isLoading } = useContext(AuthContext);
    const { event, getEventInit, eventStaff } = useContext(EventContext);

    // State of Modal for cancel event
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    // handler
    const handleCancelEvent = async () => {
        setIsCanceling(true);
        try {
            const response = await cancelEvent({ id: event.id })

            if (response.code != HttpStatusCode.Ok) {
                toast.error("Có lỗi xảy ra khi hủy sự kiện.");
                return;
            }

            toast.success("Hủy sự kiện thành công!");
            setIsCancelModalOpen(false);

            // get info event
            if (getEventInit) {
                getEventInit();
            }

        } catch (error) {
            console.error("Lỗi hủy sự kiện:", error);
            // toast.error(error.message || "Không thể hủy sự kiện lúc này.");
        } finally {
            setIsCanceling(false);
        }
    };

    if (!event || !eventStaff) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    const isEventOwner = eventStaff?.role?.name == RoleName.EVENT_OWNER.key
    const isEventAdmin = eventStaff?.role?.name == RoleName.EVENT_ADMIN.key
    const allPermission = isEventAdmin || isEventOwner
    const canCancel = event.status !== EventStatus.CANCELLED && event.status !== EventStatus.REJECTED && allPermission;
    return (
        <>
            <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 
            shrink-0 transition-colors sticky top-0 z-20">
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                        {event.name}
                    </h1>
                    <EventStatusBadge eventSessions={event.eventSessions} status={event.status} />
                </div>

                <div className="flex items-center gap-4">
                    {/* Cancel event button */}
                    {canCancel && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 
                            bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                        >
                            <Ban size={16} />
                            Hủy sự kiện
                        </button>
                    )}

                    {/* Notifications */}
                    <button className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
                        <Bell size={24} />
                        <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-card"></span>
                    </button>

                    {/* Divider */}
                    <div className="h-8 w-[1px] bg-border mx-1"></div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-2">
                        {isLoading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="flex-col items-end hidden sm:flex">
                                    <p className="text-sm font-bold text-foreground leading-none">
                                        {user?.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                                <div className="h-9 w-9 rounded-full border border-gray-200 
                                bg-gray-100 overflow-hidden flex items-center justify-center hover:ring-2 
                                hover:ring-brand hover:ring-offset-1 transition-all">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-gray-600">
                                            {getInitials(user?.fullName)}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Modal confirm cancel  */}
            <ConfirmCancelModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelEvent}
                isLoading={isCanceling}
                itemLabel={event.name}
                title="Cảnh báo: Hủy sự kiện"
                note="Việc hủy sự kiện sẽ tự động gửi thông báo đến các khách hàng đã mua vé"
            />
        </>
    );
};

export default EventMangementHeader;