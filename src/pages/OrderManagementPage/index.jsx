import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, Undo2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import DefaultPagination from '@/components/DefaultPagination';
import OrderTable from './OrderTable';

import { EventContext } from '@/context/EventContext';
import { BookingStatus } from '@/utils/constant';
import { getBookings } from '@/services/bookingService';
import { HttpStatusCode } from 'axios';
import SessionSelector from '../../components/SessionSelector';
import { refundBooking } from '@/services/paymentService';
import { routes } from '@/config/routes';

const OrderManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { event } = useContext(EventContext);
    const navigate = useNavigate()

    const [isRefunding, setIsRefunding] = useState(false);

    // define current session id
    const currentSessionId = useMemo(() => {
        const idFromUrl = searchParams.get("sessionId");
        if (idFromUrl) return Number(idFromUrl);
        if (event?.eventSessions?.length > 0) return event.eventSessions[0].id;
        return null;
    }, [searchParams, event]);

    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination & Filter States
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "10");
    const statusFilter = searchParams.get("status") || "ALL";
    const keyword = searchParams.get("search") || "";

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Auto set Session ID to URL 
    useEffect(() => {
        if (event?.eventSessions?.length > 0 && !searchParams.get("sessionId")) {
            setSearchParams(prev => {
                prev.set("sessionId", event.eventSessions[0].id);
                return prev;
            }, { replace: true });
        }
    }, [event, searchParams, setSearchParams]);

    useEffect(() => {
        fetchOrders();
    }, [currentSessionId, currentPage, pageSize, statusFilter, keyword]);

    const fetchOrders = async () => {
        if (!currentSessionId) return;
        setLoading(true);
        try {
            const status = statusFilter !== "ALL" ? statusFilter : null;

            const res = await getBookings({
                eventSessionId: currentSessionId, status: status,
                page: currentPage, size: pageSize
            });

            if (res.code == HttpStatusCode.Ok) {
                setOrderList(res.result.data);
                setTotalPages(res.result?.totalPage || 1);
                setTotalElements(res.result?.totalElements || 0);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải dữ liệu đơn hàng.");
            setOrderList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSessionChange = (id) => {
        setSearchParams(prev => {
            prev.set("sessionId", id);
            prev.set("page", "1");
            return prev;
        });
    };

    const handleFilterChange = (key, value) => {
        setSearchParams(prev => {
            if (value === "ALL" && key === "status") prev.delete(key);
            else if (!value) prev.delete(key);
            else prev.set(key, value);
            prev.set("page", "1");
            return prev;
        });
    };

    const handleViewDetail = (bookingId) => {
        navigate(routes.orderDetailOrganizer.replace(":eventId", event.id).replace(":id", bookingId))
    };

    const handleExport = () => {
        toast.success("Đang xuất file danh sách đơn hàng...");
    };

    // Handle refund
    const handleRefund = async () => {
        if (!event?.id) return;

        const isConfirmed = window.confirm("Bạn có chắc chắn muốn hoàn tiền cho các đơn hàng của sự kiện này? Hành động này không thể hoàn tác.");
        if (!isConfirmed) return;

        setIsRefunding(true);
        toast.info("Đang xử lý hoàn tiền, vui lòng đợi...");

        try {
            const response = await refundBooking({ eventId: event.id });
            
            const results = response.result || [];

            if (results.length === 0) {
                toast.warning("Không có đơn hàng nào cần/đủ điều kiện hoàn tiền.");
                return;
            }

            const successCount = results.filter(r => r.hasSuccess).length;
            const failCount = results.length - successCount;

            if (failCount === 0) {
                toast.success(`Hoàn tiền thành công toàn bộ ${successCount} đơn hàng!`);
            } else {
                toast.warning(`Hoàn tiền xong: ${successCount} thành công, ${failCount} thất bại.`);
            }

            fetchOrders();
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi hệ thống khi gọi API hoàn tiền.");
        } finally {
            setIsRefunding(false);
        }
    };

    if (!event) return <div>Đang tải thông tin sự kiện...</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        Danh sách đơn hàng
                    </h1>

                    {/* Refund button */}
                    <Button
                        variant="destructive"
                        onClick={handleRefund}
                        disabled={isRefunding || loading}
                        className="gap-2"
                    >
                        {isRefunding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                        {isRefunding ? "Đang xử lý..." : "Hoàn tiền sự kiện"}
                    </Button>
                </div>
                <p className="text-muted-foreground">Theo dõi và quản lý giao dịch mua vé của khách hàng.</p>
            </div>

            {/* Session Tabs */}
            <SessionSelector
                sessions={event.eventSessions}
                selectedSessionId={currentSessionId}
                onSelect={handleSessionChange}
            />

            {/* Toolbar Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo mã đơn, email..."
                            className="pl-9"
                            defaultValue={keyword}
                            onBlur={(e) => handleFilterChange("search", e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("search", e.currentTarget.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                        <SelectTrigger className="w-[200px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Trạng thái đơn" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value={BookingStatus.PENDING}>Đang chờ xử lý</SelectItem>
                            <SelectItem value={BookingStatus.PAID}>Đã thanh toán</SelectItem>
                            <SelectItem value={BookingStatus.CANCELLED}>Đã hủy</SelectItem>
                            <SelectItem value={BookingStatus.CANCELLED_BY_EVENT}>Sự kiện hủy</SelectItem>
                            <SelectItem value={BookingStatus.REFUNDED_CANCELLED_BY_EVENT}>Đã hoàn tiền (Sự kiện hủy)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" /> Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="mt-4">
                <OrderTable
                    data={orderList}
                    isLoading={loading}
                    onViewDetail={handleViewDetail}
                />
            </div>

            {/* Pagination */}
            {orderList.length > 0 && (
                <div className="mt-4">
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={setSearchParams}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                </div>
            )}

        </div>
    );
};

export default OrderManagementPage;