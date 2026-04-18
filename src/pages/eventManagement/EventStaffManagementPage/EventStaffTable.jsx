import React, { useContext, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { MoreVertical, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventStaffStatus, RoleName } from '@/utils/constant';
import EventStaffStatusBadge from '@/components/EventStaffStatusBadge';
import { Avatar } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AuthContext } from '@/context/AuthContex';

const getPermissionsByRole = (roleKey) => {
    switch (roleKey) {
        case 'EVENT_STAFF':
            return ['Có thể quét vé (Check-in)', 'Xem báo cáo check-in', 'Xem danh sách người tham gia và khách mời'];
        case 'EVENT_MANAGER':
            return ['Có thể quét vé (Check-in)', 'Xem báo cáo check-in', 'Xem danh sách người tham gia và khách mời',
                'Quản lý thành viên', 'Quản lý ảnh sự kiện', 'Quản lý hỏi đáp', 'Quản lý danh sách đơn hàng'];
        case 'EVENT_ADMIN':
            return ['Toàn quyền quản trị sự kiện'];
        case 'EVENT_OWNER':
            return ['Toàn quyền quản trị sự kiện'];
        default:
            return ['Chưa có thông tin phân quyền chi tiết'];
    }
};

const EventStaffTable = ({
    data,
    isLoading,
    onViewDetail,
    onRevoke,
    onResend,
    onDisable,
    isDisabling,
    onChangeRole,
    isChangingRole
}) => {
    const { user } = useContext(AuthContext);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);

    const [staffToDisable, setStaffToDisable] = useState(null);
    const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);

    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [staffToChangeRole, setStaffToChangeRole] = useState(null);
    const [newRole, setNewRole] = useState("");

    const handleViewPermission = (staff) => {
        setSelectedStaff(staff);
        setIsPermissionDialogOpen(true);
    };

    const handleOpenDisableDialog = (staff) => {
        setStaffToDisable(staff);
        setIsDisableDialogOpen(true);
    };

    const handleConfirmDisable = () => {
        if (onDisable && staffToDisable) {
            onDisable(staffToDisable);
            setIsDisableDialogOpen(false);
        }
    };

    const handleOpenRoleDialog = (staff) => {
        setStaffToChangeRole(staff);
        setNewRole(staff.role?.name || staff.roleName);
        setIsRoleDialogOpen(true);
    };

    const handleConfirmChangeRole = async () => {
        if (onChangeRole && staffToChangeRole && newRole) {
            const success = await onChangeRole(staffToChangeRole.id, newRole);
            if (success) {
                setIsRoleDialogOpen(false);
            }
        }
    };

    if (isLoading || !user) return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách nhân viên...</div>;
    if (!data || data.length === 0) return <div className="p-8 text-center text-muted-foreground">Chưa có nhân viên nào trong danh sách.</div>;
    return (
        <>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[35%]">Nhân viên</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((staff, index) => {
                            const currentRoleCode = staff.role?.name || staff.roleName;
                            console.log(staff)

                            return (
                                <TableRow key={staff.id || index} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Avatar>
                                                <DefaultAvatar user={staff} />
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{staff.email}</span>
                                                <span className="text-xs text-muted-foreground">{staff.fullName}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {RoleName[currentRoleCode]?.label || currentRoleCode}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <EventStaffStatusBadge status={staff.status} />
                                    </TableCell>

                                    <TableCell className="text-right pr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onViewDetail(staff)}>
                                                    Xem chi tiết & Lịch sử
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => handleViewPermission(staff)}>
                                                    Xem quyền hạn
                                                </DropdownMenuItem>

                                                {currentRoleCode !== RoleName.EVENT_OWNER.key && user.id != staff.userId && (
                                                    <DropdownMenuItem onClick={() => handleOpenRoleDialog(staff)}>
                                                        Thay đổi vai trò
                                                    </DropdownMenuItem>
                                                )}

                                                {staff.status === EventStaffStatus.PENDING && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onResend(staff)}>
                                                            Gửi lại
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onRevoke(staff)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            Thu hồi lời mời
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                {staff.status !== EventStaffStatus.PENDING && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleOpenDisableDialog(staff)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            {staff.status == EventStaffStatus.ACTIVE ? 'Vô hiệu hóa' : 'Bật hoạt động'}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog change role */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thay đổi vai trò nhân viên</DialogTitle>
                    </DialogHeader>
                    {staffToChangeRole && (
                        <div className="py-4 space-y-5">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Nhân viên đang cập nhật:</p>
                                <p className="font-medium text-base">
                                    {staffToChangeRole.user?.fullName || staffToChangeRole.email}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Chọn vai trò mới</label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EVENT_ADMIN">Quản trị viên (Event Admin)</SelectItem>
                                        <SelectItem value="EVENT_MANAGER">Quản lý (Event Manager)</SelectItem>
                                        <SelectItem value="EVENT_STAFF">Nhân viên checkin (Event Staff)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={isChangingRole}>
                            Hủy bỏ
                        </Button>
                        <Button
                            onClick={handleConfirmChangeRole}
                            disabled={isChangingRole || newRole === (staffToChangeRole?.role?.name || staffToChangeRole?.roleName)}
                        >
                            {isChangingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cập nhật vai trò
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog display role */}
            <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chi tiết quyền hạn</DialogTitle>
                    </DialogHeader>
                    {selectedStaff && (
                        <div className="py-4">
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground">Nhân viên:</p>
                                <p className="font-medium">{selectedStaff.user?.fullName || selectedStaff.email}</p>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground">Vai trò:</p>
                                <p className="font-medium">{RoleName[selectedStaff.role?.name]?.label || selectedStaff.roleName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Danh sách quyền có thể thực hiện:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {getPermissionsByRole(selectedStaff.role?.name || selectedStaff.roleName).map((permission, idx) => (
                                        <li key={idx} className="text-sm font-medium">{permission}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isDisableDialogOpen}
                onOpenChange={setIsDisableDialogOpen}
                onConfirm={handleConfirmDisable}
                title={staffToDisable?.status == EventStaffStatus.ACTIVE ?
                    "Vô hiệu hóa nhân viên" : "Bật tài khoản hoạt động"}
                description={
                    staffToDisable?.status == EventStaffStatus.ACTIVE ?
                        <span>
                            Bạn có chắc chắn muốn vô hiệu hóa nhân viên <strong>{staffToDisable?.user?.fullName || staffToDisable?.email}</strong>?
                            Nhân viên này sẽ không thể truy cập và quản lý sự kiện này nữa.
                        </span> :
                        <span>
                            Bạn có chắc chắn muốn bật hoạt động cho nhân viên
                            <strong> {staffToDisable?.user?.fullName || staffToDisable?.email}</strong>?
                            Nhân viên này sẽ có thể truy cập và quản lý sự kiện này.
                        </span>
                }
                confirmLabel="Xác nhận"
                cancelLabel="Hủy bỏ"
                variant="destructive"
                isLoading={isDisabling}
            />
        </>
    );
};

export default EventStaffTable;