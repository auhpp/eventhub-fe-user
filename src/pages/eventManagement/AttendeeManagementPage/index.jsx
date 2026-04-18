import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Download, UserPlus, Users, Mail, Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import SessionSelector from '../../../components/SessionSelector';
import AttendeeTable from './AttendeeTable';
import DefaultPagination from '@/components/DefaultPagination';
import GuestTable from './GuestTable';

import { getEventInvitations, revokeEventInvitation } from '@/services/eventInvitationService';
import { EventContext } from '@/context/EventContext';
import InviteGuestDialog from '@/features/attendee/InviteGuestDialog';
import InvitationDetail from './InvitationDetail';
import { HttpStatusCode } from 'axios';
import { AttendeeStatus, AttendeeType, InvitationStatus } from '@/utils/constant';
import { getUserSummaryAttendees, importCheckInAttendance, exportReportAttendees } from '@/services/attendeeService';
import { isExpiredEventSessionStartDate, isToTimeCheckIn } from '@/utils/eventUtils';
import ImportCheckInDialog from './ImportCheckInDialog';
import FailedEmailsDialog from '@/features/eventStaff/FailedEmailsDialog';
import { isValidEmail } from '@/utils/validates';
import { routes } from '@/config/routes';

const AttendeeManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { event } = useContext(EventContext);
    const [detailToken, setDetailToken] = useState(null);
    const [isInviteDetailOpen, setIsInviteDetailOpen] = useState(false);
    const [currentSession, setCurrentSession] = useState()
    const navigate = useNavigate();

    const currentSessionId = useMemo(() => {
        const idFromUrl = searchParams.get("sessionId");
        if (idFromUrl) return Number(idFromUrl);
        if (event?.eventSessions?.length > 0) return event.eventSessions[0].id;
        return null;
    }, [searchParams, event]);

    const currentTab = searchParams.get("tab") || "participants";

    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isExporting, setIsExporting] = useState(false);

    // --- STATES for IMPORT & FAILED EMAILS ---
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isFailedDialogOpen, setIsFailedDialogOpen] = useState(false);
    const [failedEmailsList, setFailedEmailsList] = useState([]);

    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "10");
    const statusFilter = searchParams.get("status") || "ALL";
    const keyword = searchParams.get("search") || "";
    const typeFilter = searchParams.get("type") || "ALL";

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [isInviteOpen, setIsInviteOpen] = useState(false);

    useEffect(() => {
        if (event?.eventSessions?.length > 0 && !searchParams.get("sessionId")) {
            setSearchParams(prev => {
                prev.set("sessionId", event.eventSessions[0].id);
                return prev;
            }, { replace: true });
        }
    }, [event, searchParams, setSearchParams]);

    useEffect(() => {
        fetchData();
    }, [currentSessionId, currentPage, pageSize, statusFilter, keyword, currentTab, typeFilter]);

    const fetchData = async () => {
        if (!currentSessionId) return;
        setLoading(true);
        try {
            let res;
            if (currentTab === 'guests') {
                res = await getEventInvitations({
                    email: keyword == "" ? null : keyword,
                    eventSessionId: currentSessionId,
                    status: statusFilter,
                    page: currentPage,
                    size: pageSize
                });
            } else {
                const types = typeFilter == "ALL" ? null : (
                    typeFilter == "INVITATION" ? [AttendeeType.INVITE] :
                     [AttendeeType.BUY, AttendeeType.RESALE,
                    AttendeeType.GIFT]
                )
                const statues = statusFilter === "ALL" ?
                 [AttendeeStatus.VALID.key, AttendeeStatus.CHECKED_IN.key,
                AttendeeStatus.CANCELLED_BY_EVENT.key] : [statusFilter];
                res = await getUserSummaryAttendees({
                    name: !isValidEmail(keyword) ? keyword : null,
                    email: isValidEmail(keyword) ? keyword : null,
                    eventSessionId: currentSessionId,
                    types: types,
                    statuses: statues,
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
            prev.set("search", "");
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
            navigate(routes.userBookingDetail.replace(":id", event.id).replace(":eventSessionId", currentSessionId)
                .replace(":userId", item));
        } else {
            setDetailToken(item.token);
            setIsInviteDetailOpen(true);
        }
    };

    // export excel function
    const handleExport = async () => {
        if (!currentSessionId || !event) return;

        if (!dataList || dataList.length === 0) {
            toast.warning("Không có dữ liệu người tham gia nào để xuất!");
            return;
        }

        try {
            setIsExporting(true);
            toast.info("Hệ thống đang chuẩn bị báo cáo, vui lòng đợi...");

            const types = typeFilter === "ALL" ? null : (
                typeFilter === "INVITATION" ? [AttendeeType.INVITE] :
                 [AttendeeType.BUY, AttendeeType.RESALE, AttendeeType.GIFT]
            );
            const statues = statusFilter === "ALL" ? 
            [AttendeeStatus.VALID.key, AttendeeStatus.CHECKED_IN.key,
            AttendeeStatus.CANCELLED_BY_EVENT.key] : [statusFilter];

            const blobData = await exportReportAttendees({
                email: isValidEmail(keyword) ? keyword : null,
                name: !isValidEmail(keyword) && keyword !== "" ? keyword : null,
                types: types,
                eventSessionId: currentSessionId,
                statuses: statues,
                eventName: event.name
            });

            // trigger download
            const blob = new Blob([blobData], 
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;

            // handle file name
            const safeEventName = event.name.replace(/[^a-zA-Z0-9]/g, '_');
            link.setAttribute('download', `Danh_Sach_Tham_Gia_${safeEventName}.xlsx`);

            document.body.appendChild(link);
            link.click();

            // clean up
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success("Xuất danh sách thành công!");

        } catch (error) {
            console.error("Lỗi xuất báo cáo:", error);
            toast.error("Không thể xuất file lúc này, vui lòng thử lại sau!");
        } finally {
            setIsExporting(false);
        }
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

    const handleDownloadTemplate = () => {
        const csvContent = "\uFEFFEmail\nnguyenvana@gmail.com\ntranthib@yahoo.com\nkhachhang@domain.com";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "mau_diem_danh_su_kien.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConfirmImport = async (emailsArray) => {
        setIsImporting(true);
        const toastId = toast.loading("Đang xử lý điểm danh...");
        try {
            const response = await importCheckInAttendance({
                id: currentSessionId,
                emails: emailsArray
            });

            const { successCount, failedCount, failedEmails } = response.result || response;

            if (failedCount > 0) {
                toast.dismiss(toastId);
                const formattedFailedEmails = (failedEmails || []).map(emailStr => ({
                    email: emailStr,
                    message: "Không tìm thấy vé trong hệ thống"
                }));

                setFailedEmailsList(formattedFailedEmails);
                setIsFailedDialogOpen(true);
            } else {
                toast.success(`Đã điểm danh thành công ${successCount} người!`, { id: toastId });
            }

            setIsImportDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Lỗi khi gọi API import.", { id: toastId });
        } finally {
            setIsImporting(false);
        }
    };

    useEffect(() => {
        const session = event.eventSessions.find(es => es.id == currentSessionId)
        setCurrentSession(session)
    }, [event, currentSessionId])

    if (!event) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý tham gia & Khách mời</h1>
                <p className="text-muted-foreground">Theo dõi người mua vé và quản lý lời mời tham dự sự kiện.</p>
            </div>

            <SessionSelector
                sessions={event.eventSessions}
                selectedSessionId={currentSessionId}
                onSelect={handleSessionChange}
            />

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

                    {currentTab === 'guests' && currentSession && !isExpiredEventSessionStartDate({ startDateTime: currentSession.startDateTime }) && (
                        <Button className="gap-2" onClick={() => setIsInviteOpen(true)}>
                            <UserPlus size={16} /> Gửi lời mời
                        </Button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={currentTab == 'guests' ? "Tìm theo email..." : "Tìm theo tên, email,..."}
                                className="pl-9"
                                defaultValue={keyword}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("search", e.currentTarget.value)}
                            />
                        </div>
                        {currentTab === 'participants' && (
                            <Select value={typeFilter} onValueChange={(val) => handleFilterChange("type", val)}>
                                <SelectTrigger className="w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <SelectValue placeholder="Trạng thái" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả loại</SelectItem>
                                    <SelectItem value={"ATTENDEE"}>Người tham gia</SelectItem>
                                    <SelectItem value={"INVITATION"}>Khách mời</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <SelectValue placeholder="Trạng thái" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                {currentTab === 'participants' ? (
                                    <>
                                        <SelectItem value={AttendeeStatus.VALID.key}>Chưa check-in</SelectItem>
                                        <SelectItem value={AttendeeStatus.CHECKED_IN.key}>Đã Check-in</SelectItem>
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
                        {currentTab === 'participants' && currentSession &&
                            isToTimeCheckIn({ checkinStartTime: currentSession.checkinStartTime }) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Điểm danh bằng File
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem onClick={handleDownloadTemplate} className="cursor-pointer">
                                            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                            <span>Tải file mẫu (.csv)</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)} className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4 text-blue-600" />
                                            <span>Chọn file tải lên</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                        {currentTab === 'participants' &&
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                {isExporting ? "Đang xuất..." : "Xuất Excel"}
                            </Button>
                        }
                    </div>
                </div>

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

            <ImportCheckInDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                onConfirm={handleConfirmImport}
                isImporting={isImporting}
            />

            <FailedEmailsDialog
                open={isFailedDialogOpen}
                onOpenChange={setIsFailedDialogOpen}
                failedEmails={failedEmailsList}
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