import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Filter, UserPlus, Users, Mail } from "lucide-react";
import { toast } from "sonner";

import SessionSelector from './SessionSelector';
import AttendeeTable from './AttendeeTable';
import UserBookingDetail from './UserBookingDetail';
import DefaultPagination from '@/components/DefaultPagination';
import GuestTable from './GuestTable';

import { getUserSummaryBookings } from '@/services/bookingService';
import { getEventInvitations, revokeEventInvitation } from '@/services/eventInvitationService';
import { EventContext } from '@/context/EventContext';
import InviteGuestDialog from '@/features/attendee/InviteGuestDialog';
import InvitationDetail from './InvitationDetail';
import { HttpStatusCode } from 'axios';
import { BookingStatus, InvitationStatus } from '@/utils/constant';

const AttendeeManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { event } = useContext(EventContext);
    const [detailToken, setDetailToken] = useState(null);
    const [isInviteDetailOpen, setIsInviteDetailOpen] = useState(false);

    const currentSessionId = useMemo(() => {
        const idFromUrl = searchParams.get("sessionId");
        if (idFromUrl) return Number(idFromUrl);
        if (event?.eventSessions?.length > 0) return event.eventSessions[0].id;
        return null;
    }, [searchParams, event]);

    const currentTab = searchParams.get("tab") || "participants";

    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination & Filter
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "10");
    const statusFilter = searchParams.get("status") || "ALL";
    const keyword = searchParams.get("search") || "";

    // Pagination Result
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Modal States
    const [detailUserId, setDetailUserId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Auto-sync Session ID URL
    useEffect(() => {
        if (event?.eventSessions?.length > 0 && !searchParams.get("sessionId")) {
            setSearchParams(prev => {
                prev.set("sessionId", event.eventSessions[0].id);
                return prev;
            }, { replace: true });
        }
    }, [event, searchParams, setSearchParams]);

    // Main Fetch Data Effect
    useEffect(() => {
        fetchData();
    }, [currentSessionId, currentPage, pageSize, statusFilter, keyword, currentTab]);

    const fetchData = async () => {
        if (!currentSessionId) return;
        setLoading(true);
        try {
            let res;
            if (currentTab === 'guests') {
                res = await getEventInvitations({
                    eventSessionId: currentSessionId,
                    status: statusFilter,
                    page: currentPage,
                    size: pageSize
                });
            } else {
                res = await getUserSummaryBookings({
                    eventSessionId: currentSessionId,
                    status: statusFilter,
                    keyword: keyword,
                    page: currentPage,
                    size: pageSize
                });
            }

            const resultData = res.result?.data || res.content || [];
            setDataList(resultData);
            setTotalPages(res.result?.totalPage || res.totalPages || 1);
            setTotalElements(res.result?.totalElements || res.totalElements || 0);

        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải dữ liệu.");
            setDataList([]);
        } finally {
            setLoading(false);
        }
    };


    const handleTabChange = (value) => {
        setSearchParams(prev => {
            prev.set("tab", value);
            prev.set("page", "1");
            prev.delete("status");
            return prev;
        });
        setDataList([]);
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

    const handleViewDetail = (item) => {
        if (currentTab === 'participants') {
            setDetailUserId(item);
            setIsDetailOpen(true);
        } else {
            setDetailToken(item.token);
            setIsInviteDetailOpen(true);
        }
    };

    const handleExport = () => {
        toast.success(`Đang xuất file ${currentTab === 'guests' ? 'khách mời' : 'người tham gia'}...`);
    };

    const handleRevoveEventInvitation = async (invite) => {
        try {
            const response = await revokeEventInvitation({ id: invite.id })
            if (response.code == HttpStatusCode.Ok) {
                fetchData()
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (!event) return <div>Đang tải thông tin sự kiện...</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý tham gia & Khách mời</h1>
                <p className="text-muted-foreground">Theo dõi người mua vé và quản lý lời mời tham dự sự kiện.</p>
            </div>

            {/* Session Tabs (Date Selection) */}
            <SessionSelector
                sessions={event.eventSessions}
                selectedSessionId={currentSessionId}
                onSelect={handleSessionChange}
            />

            {/* MAIN TABS: Participants vs Guests */}
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full space-y-4">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="participants" className="gap-2">
                            <Users size={16} /> Người tham gia
                        </TabsTrigger>
                        <TabsTrigger value="guests" className="gap-2">
                            <Mail size={16} /> Khách mời
                        </TabsTrigger>
                    </TabsList>

                    {/* Button invite */}
                    {currentTab === 'guests' && (
                        <Button className="gap-2" onClick={() => setIsInviteOpen(true)}>
                            <UserPlus size={16} /> Gửi lời mời
                        </Button>
                    )}
                </div>

                {/* Toolbar Filter (Reused for both tabs) */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên, email..."
                                className="pl-9"
                                defaultValue={keyword}
                                onBlur={(e) => handleFilterChange("search", e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("search", e.currentTarget.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Trạng thái" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                {currentTab === 'participants' ? (
                                    <>
                                        <SelectItem value={BookingStatus.PAID}>Đã thanh toán</SelectItem>
                                        <SelectItem value={BookingStatus.CANCELLED}>Đã hủy</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value={InvitationStatus.PENDING}>Đã gửi mời</SelectItem>
                                        <SelectItem value={InvitationStatus.ACCEPTED}>Đã nhận vé</SelectItem>
                                        <SelectItem value={InvitationStatus.REJECTED}>Từ chối</SelectItem>
                                        <SelectItem value={InvitationStatus.REVOKED}>Đã thu hồi</SelectItem>

                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleExport}>
                            <Download className="h-4 w-4" /> Xuất Excel
                        </Button>
                    </div>
                </div>

                {/* Tab Contents */}
                <TabsContent value="participants" className="mt-0 space-y-4">
                    <AttendeeTable
                        data={dataList}
                        isLoading={loading}
                        onViewDetail={handleViewDetail}
                    />
                </TabsContent>

                <TabsContent value="guests" className="mt-0 space-y-4">
                    <GuestTable
                        data={dataList}
                        isLoading={loading}
                        onViewDetail={(invite) => handleViewDetail(invite)}
                        onRevoke={handleRevoveEventInvitation}
                    />
                </TabsContent>
            </Tabs>

            {/* Pagination */}
            {dataList.length > 0 && (
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

            {/* Modal Components */}
            <UserBookingDetail
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                eventSessionId={currentSessionId}
                userId={detailUserId}
            />

            <InviteGuestDialog
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                sessions={event.eventSessions}
                currentSessionId={currentSessionId}
                onSuccess={() => fetchData()}
            />
            <InvitationDetail
                isOpen={isInviteDetailOpen}
                onClose={() => setIsInviteDetailOpen(false)}
                eventSessionId={currentSessionId}
                token={detailToken}
            />
        </div>
    );
};

export default AttendeeManagementPage;