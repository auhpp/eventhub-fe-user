import React, { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Edit, Trash2, Info
    } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { routes } from "@/config/routes";

import { getResalePostById, cancelResalePost } from "@/services/resalePostService";
import { getEventById } from "@/services/eventService";

import ResaleTicketCard from "@/features/resale/ResaleTicketCard";
import { ConfirmCancelModal } from "@/components/ConfirmCancelModal";
import { HttpStatusCode } from "axios";
import { AttendeeStatus, EventType, ResalePostStatus } from "@/utils/constant";
import ButtonBack from "@/components/ButtonBack";
import ResalePostStatusBadge from "@/components/ResalePostStatusBadge";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getEventSessionById } from "@/services/eventSessionService";

const ResaleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // States Data
    const [postData, setPostData] = useState(null);
    const [eventData, setEventData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [eventSession, setEventSession] = useState(null);

    // States for cancel Modal
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchDetail = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. get resale post
            const post = await getResalePostById({ id: id });
            if (post.code == HttpStatusCode.Ok) {
                setPostData(post.result);
            }

            // 2. get event info
            if (post.result?.attendees?.length > 0) {
                const eventId = post.result.attendees[0].ticket.eventId;
                const event = await getEventById({ id: eventId });
                if (event.code == HttpStatusCode.Ok) {
                    setEventData(event.result);
                }
                const eventSessionId = post.result.attendees[0].ticket.eventSessionId;
                const eventSesionRes = await getEventSessionById({ id: eventSessionId });
                if (eventSesionRes.code == HttpStatusCode.Ok) {
                    setEventSession(eventSesionRes.result);
                }
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Không thể tải thông tin bài đăng.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchDetail();
    }, [id, fetchDetail]);

    const handleEdit = () => {
        navigate(routes.editResalePost.replace(":id", postData.id));
    };

    const handleConfirmCancel = async () => {
        setIsCancelling(true);
        try {
            const res = await cancelResalePost({ id: postData.id });
            if (res.code == HttpStatusCode.Ok) {
                toast.success("Đã hủy bài đăng thành công.");
                setPostData(prev => ({
                    ...prev,
                    status: "CANCELLED_BY_USER"
                }));
                setIsCancelModalOpen(false);
            }
        } catch (error) {
            console.error("Lỗi khi hủy bài đăng:", error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi hủy bài đăng. Vui lòng thử lại.");
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    if (!postData) return <div className="p-8 text-center text-slate-500">Không tìm thấy dữ liệu.</div>;

    // stats ticket
    const totalTickets = postData.attendees?.length || 0;
    const soldTickets = postData.attendees?.filter(a => a.status === AttendeeStatus.RESOLD.key).length || 0;
    const canEditOrCancel = postData.status === ResalePostStatus.PENDING || postData.status === ResalePostStatus.APPROVED;

    return (
        <div className="min-h-screen ">
            <ConfirmCancelModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                isLoading={isCancelling}
                title="Hủy bài đăng bán lại"
                itemLabel={`Bài đăng mã #${postData.id}`}
                note="Hành động này sẽ gỡ bài đăng khỏi danh sách bán. Các vé chưa bán sẽ được hoàn về kho vé của bạn."
            />

            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2 items-center">
                    <ButtonBack />
                    <h1 className="text-2xl font-bold text-slate-900">Chi tiết bán lại vé</h1>
                </div>

                {canEditOrCancel && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleEdit} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setIsCancelModalOpen(true)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Hủy bài đăng
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-6">

                {/* Block 1: post info */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Ngày đăng: {formatDateTime(postData.createdAt)}
                            </div>
                        </div>
                        <ResalePostStatusBadge status={postData.status} />
                    </div>

                    {/* rejection reason message */}
                    {postData.status === "REJECTED" && postData.rejectionMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                            <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-red-800">Lý do từ chối</h4>
                                <p className="text-sm text-red-600 mt-1">{postData.rejectionMessage}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div>
                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Giá bán mỗi vé</div>
                            <div className="text-xl font-bold text-red-600">
                                {formatCurrency(postData.pricePerTicket)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Hình thức bán</div>
                            <div className="font-medium flex items-center gap-1.5 text-slate-700">
                                {postData.hasRetail ? "Bán lẻ" : "Không bán lẻ"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Block 2: event info */}
                {eventData && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Thông tin sự kiện
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {eventData.thumbnail && (
                                <img src={eventData.thumbnail} alt={eventData.name}
                                    className="w-full sm:w-32 sm:h-32 object-cover rounded-lg border" />
                            )}
                            <div>
                                <h4 className="font-semibold text-slate-900 text-lg">{eventData.name}</h4>
                                <div className="flex items-center gap-2 text-md text-slate-600 mt-2">
                                    {eventData.type === EventType.ONLINE.key ? "Sự kiện Online" :
                                        `${eventData.address}, ${eventData.location}`}
                                </div>
                                <div className="flex items-center gap-2 text-md text-slate-600 mt-1">
                                    Loại sự kiện: {eventData.category?.name || "Khác"}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 text-slate-600 mt-1">
                                    <span>
                                        {formatDateTime(eventSession.startDateTime)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Block 3: ticket list */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Danh sách vé</h3>
                        <div className="text-sm font-medium bg-slate-100 px-3 py-1.5 rounded-md text-slate-600">
                            Đã bán: {soldTickets}/{totalTickets}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto
                     pr-1 custom-scrollbar">
                        {postData.attendees?.map((attendee) => (
                            <ResaleTicketCard key={attendee.id} attendee={attendee} />
                        ))}
                        {(!postData.attendees || postData.attendees.length === 0) && (
                            <div className="col-span-full text-center text-slate-500 text-sm py-8">Không có vé nào.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResaleDetailPage;