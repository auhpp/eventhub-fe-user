import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Loader2, X, ArrowUpDown, RotateCcw } from "lucide-react"; // Import thêm icon X
import { toast } from "sonner";

import DefaultPagination from '@/components/DefaultPagination';
import OrderTable from './OrderTable';
import DatePicker from '@/components/DatePicker';

import { EventContext } from '@/context/EventContext';
import { BookingStatus, BookingType } from '@/utils/constant';
import { getBookings } from '@/services/bookingService';
import { exportReportBookings } from '@/services/bookingService';
import { HttpStatusCode } from 'axios';
import SessionSelector from '../../../components/SessionSelector';
import { routes } from '@/config/routes';
import { isValidEmail } from '@/utils/validates';

const OrderManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { event } = useContext(EventContext);
    const navigate = useNavigate();

    // define current session id
    const currentSessionId = useMemo(() => {
        const idFromUrl = searchParams.get("sessionId");
        if (idFromUrl) return Number(idFromUrl);
        if (event?.eventSessions?.length > 0) return event.eventSessions[0].id;
        return null;
    }, [searchParams, event]);

    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false); 

    // Pagination & Filter States
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "10");
    const statusFilter = searchParams.get("status") || "ALL";
    const keyword = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") || "ALL";

    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // check if any filter is active 
    const hasActiveFilters = Boolean(
        keyword ||
        (statusFilter && statusFilter !== "ALL") ||
        (typeFilter && typeFilter !== "ALL") ||
        startDate ||
        endDate
    );

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
    }, [currentSessionId, currentPage, pageSize, statusFilter, keyword, typeFilter, startDate, endDate]);

    const fetchOrders = async () => {
        if (!currentSessionId) return;
        setLoading(true);
        try {
            const status = statusFilter !== "ALL" ? statusFilter : null;
            const types = typeFilter === "ALL" ? [BookingType.RESALE, BookingType.BUY] : (
                typeFilter === "RESALE" ? [BookingType.RESALE] : [BookingType.BUY]
            );

            const formattedStartDateTime = startDate ? `${startDate}T00:00:00` : null;
            const formattedEndDateTime = endDate ? `${endDate}T23:59:59` : null;

            const res = await getBookings({
                types: types,
                email: isValidEmail(keyword) ? keyword : null,
                bookingId: !isValidEmail(keyword) ? (Number(keyword) ? Number(keyword) : null) : null,
                eventSessionId: currentSessionId,
                status: status,
                page: currentPage,
                size: pageSize,
                startDateTime: formattedStartDateTime,
                endDateTime: formattedEndDateTime
            });

            if (res.code === HttpStatusCode.Ok) {
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
            else if (value === "ALL" && key === "type") prev.delete(key);
            else if (!value) prev.delete(key);
            else prev.set(key, value);
            prev.set("page", "1");
            return prev;
        });
    };

    // --- clear filters ---
    const handleClearFilters = () => {
        setSearchParams(prev => {
            prev.delete("search");
            prev.delete("status");
            prev.delete("type");
            prev.delete("startDate");
            prev.delete("endDate");
            prev.set("page", "1"); 
            return prev;
        });
    };

    const handleViewDetail = (bookingId) => {
        navigate(routes.orderDetailOrganizer.replace(":id", event.id).replace(":orderId", bookingId));
    };

    // --- export report ---
    const handleExport = async () => {
        if (!currentSessionId || !event) return;

        if (!orderList || orderList.length === 0) {
            toast.warning("Không có dữ liệu đơn hàng nào để xuất!");
            return;
        }

        try {
            setIsExporting(true);
            toast.info("Hệ thống đang chuẩn bị báo cáo, vui lòng đợi...");

            const status = statusFilter !== "ALL" ? statusFilter : null;
            const types = typeFilter === "ALL" ? [BookingType.RESALE, BookingType.BUY] : (
                typeFilter === "RESALE" ? [BookingType.RESALE] : [BookingType.BUY]
            );

            const formattedStartDateTime = startDate ? `${startDate}T00:00:00` : null;
            const formattedEndDateTime = endDate ? `${endDate}T23:59:59` : null;

            const blobData = await exportReportBookings({
                types: types,
                email: isValidEmail(keyword) ? keyword : null,
                bookingId: !isValidEmail(keyword) ? (Number(keyword) ? Number(keyword) : null) : null,
                eventSessionId: currentSessionId,
                status: status,
                startDateTime: formattedStartDateTime,
                endDateTime: formattedEndDateTime,
                eventName: event.name
            });

            const blob = new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;

            const safeEventName = event.name.replace(/[^a-zA-Z0-9]/g, '_');
            link.setAttribute('download', `Bao_Cao_${safeEventName}.xlsx`);

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success("Xuất báo cáo Excel thành công!");

        } catch (error) {
            console.error("Lỗi xuất báo cáo:", error);
            toast.error("Không thể xuất file lúc này, vui lòng thử lại sau!");
        } finally {
            setIsExporting(false);
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
            <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border shadow-sm">

                {/* Hàng 1: Search & Dropdowns */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
                    <div className="flex flex-1 items-center gap-4 w-full sm:w-auto flex-wrap">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                key={keyword || 'search-input'} 
                                placeholder="Tìm theo mã đơn, email..."
                                className="pl-9"
                                defaultValue={keyword}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("search", e.currentTarget.value)}
                            />
                        </div>

                        {/* type filter */}
                        <Select value={typeFilter} onValueChange={(val) => handleFilterChange("type", val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Loại đơn" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả loại</SelectItem>
                                <SelectItem value={"BUY"}>Mua vé thường</SelectItem>
                                <SelectItem value={"RESALE"}>Mua lại vé</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trạng thái đơn" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                <SelectItem value={BookingStatus.PAID}>Đã thanh toán</SelectItem>
                                <SelectItem value={BookingStatus.CANCELLED_BY_EVENT}>Sự kiện hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="shrink-0"
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {isExporting ? "Đang xuất file..." : "Xuất Excel"}
                    </Button>
                </div>

                {/* Date Pickers & Nút Clear Filter */}
                <div className="flex flex-col sm:flex-row gap-4 items-end justify-between w-full">
                    <div className="flex items-end gap-4 flex-wrap">
                        <div className="w-[200px]">
                            <DatePicker
                                label="Từ ngày"
                                value={startDate}
                                onChange={(val) => handleFilterChange("startDate", val)}
                            />
                        </div>
                        <div className="w-[200px]">
                            <DatePicker
                                label="Đến ngày"
                                value={endDate}
                                onChange={(val) => handleFilterChange("endDate", val)}
                            />
                        </div>

                        {/* clear filters button */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                className="h-10 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 
                        flex items-center gap-2 transition-colors"
                                onClick={handleClearFilters}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" /> Xóa bộ lọc
                            </Button>
                        )}
                    </div>
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