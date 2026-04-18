import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import DefaultPagination from '@/components/DefaultPagination';

import { createEventStaff, getEventStaffs, revokeEventStaff, disableEventStaff, changeRoleEventStaff } from '@/services/eventStaffService';
import { EventContext } from '@/context/EventContext';
import { EventStaffStatus } from '@/utils/constant';
import EventStaffTable from './EventStaffTable';
import StaffInvitationDetail from './StaffInvitationDetail';
import InviteStaffDialog from '@/features/eventStaff/InviteStaffDialog';
import { HttpStatusCode } from 'axios';

const EventStaffManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { event } = useContext(EventContext);

    // State detail Modal
    const [detailId, setDetailId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // State invitation Modal
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isDisabling, setIsDisabling] = useState(false);
    const [isChangingRole, setIsChangingRole] = useState(false);

    // Pagination & Filter
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "10");
    const statusFilter = searchParams.get("status") || "ALL";
    const keyword = searchParams.get("search") || "";

    // Pagination Result
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, [event?.id, currentPage, pageSize, statusFilter, keyword]);

    const fetchData = async () => {
        if (!event?.id) return;
        setLoading(true);
        try {
            const res = await getEventStaffs({
                eventId: event.id,
                email: keyword.trim(),
                status: statusFilter,
                page: currentPage,
                size: pageSize
            });
            if (res.code == HttpStatusCode.Ok) {
                const resultData = res.result?.data || [];
                setDataList(resultData);
                setTotalPages(res.result?.totalPage || 1);
                setTotalElements(res.result?.totalElements || 0);
            }

        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách nhân viên.");
            setDataList([]);
        } finally {
            setLoading(false);
        }
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
        setDetailId(item.id);
        setIsDetailOpen(true);
    };

    const handleRevokeStaff = async (staff) => {
        try {
            const response = await revokeEventStaff({ id: staff.id });
            if (response.code == HttpStatusCode.Ok) {
                toast.success("Đã thu hồi lời mời nhân viên.");
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể thu hồi lời mời.");
        }
    };

    const handleDisableStaff = async (staff) => {
        setIsDisabling(true);
        try {
            const response = await disableEventStaff({ id: staff.id });
            if (response && response.code == HttpStatusCode.Ok) {
                toast.success(`Đã cập nhật trạng thái tài khoản của ${staff.email}.`);
                fetchData();
            }
        } catch (error) {
            console.error("Lỗi vô hiệu hóa nhân viên:", error);
            toast.error("Không thể vô hiệu hóa nhân viên. Vui lòng thử lại!");
        } finally {
            setIsDisabling(false);
        }
    };

    const handleChangeRole = async (staffId, newRoleName) => {
        setIsChangingRole(true);
        try {
            const response = await changeRoleEventStaff({ eventStaffId: staffId, roleName: newRoleName });
            if (response.code == HttpStatusCode.Ok) {
                toast.success("Đã thay đổi vai trò nhân viên thành công.");
                fetchData();
                return true; 
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi vai trò:", error);
            toast.error("Không thể thay đổi vai trò. Vui lòng thử lại!");
            return false;
        } finally {
            setIsChangingRole(false);
        }
    };

    const handleResend = async (staff) => {
        try {
            const response = await createEventStaff({
                emails: [staff.email],
                eventId: staff.eventId,
                message: staff.message,
                roleName: staff.role?.name || staff.roleName,
                expiredAt: null,
            });
            if (response.code == HttpStatusCode.Ok) {
                toast.success("Gửi lời mời lại thành công.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể gửi lời mời! Hãy thử lại");
        }
    };

    if (!event) return <div>Đang tải thông tin sự kiện...</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý thành viên</h1>
                <p className="text-muted-foreground">Phân quyền và quản lý danh sách nhân viên hỗ trợ sự kiện.</p>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo email nhân viên..."
                            className="pl-9"
                            defaultValue={keyword}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("search", e.currentTarget.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <SelectValue placeholder="Trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value={EventStaffStatus.PENDING}>Đang chờ</SelectItem>
                            <SelectItem value={EventStaffStatus.ACTIVE}>Đang hoạt động</SelectItem>
                            <SelectItem value={EventStaffStatus.REJECTED}>Đã từ chối</SelectItem>
                            <SelectItem value={EventStaffStatus.REVOKED}>Đã thu hồi</SelectItem>
                            <SelectItem value={EventStaffStatus.INACTIVE}>Vô hiệu hóa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button className="gap-2" onClick={() => setIsInviteOpen(true)}>
                        <UserPlus size={16} /> Mời nhân viên
                    </Button>
                </div>
            </div>

            {/* Table Content */}
            <EventStaffTable
                data={dataList}
                isLoading={loading}
                onViewDetail={handleViewDetail}
                onRevoke={handleRevokeStaff}
                onResend={handleResend}
                onDisable={handleDisableStaff}
                isDisabling={isDisabling}
                onChangeRole={handleChangeRole} 
                isChangingRole={isChangingRole} 
            />

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

            {/* Modals */}
            <InviteStaffDialog
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                eventId={event.id}
                onSuccess={() => fetchData()}
            />

            <StaffInvitationDetail
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                id={detailId}
            />
        </div>
    );
};

export default EventStaffManagementPage;