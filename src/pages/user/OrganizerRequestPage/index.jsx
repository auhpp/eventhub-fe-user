import React, { useState, useEffect, useContext } from "react";
import {
    PlusCircle,
    Loader2,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "@/config/routes";
import { getOrganizerRegistrations } from "@/services/organizerRegistrationService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { AuthContext } from "@/context/AuthContex";
import { OrganizerType, RegistrationStatus, Role } from "@/utils/constant";
import DefaultPagination from "@/components/DefaultPagination";
import { HttpStatusCode } from "axios";
import DefaultAvatar from "@/components/DefaultAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function OrganizerRequestPage() {
    const [organizerRegistrations, setOrganizerRegistrations] = useState(null)
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 2;

    const statusFilter = searchParams.get("status") || "ALL";


    useEffect(
        () => {
            const fetchorganizerRegistrations = async () => {
                try {
                    const response = await getOrganizerRegistrations({
                        status: statusFilter == "ALL" ? null : statusFilter,
                        userId: user.id,
                        page: currentPage, size: pageSize
                    })
                    if (response.code == HttpStatusCode.Ok) {
                        setOrganizerRegistrations(response.result.data)
                        setTotalPages(response.result.totalPage);
                        setTotalElements(response.result.totalElements);
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            fetchorganizerRegistrations()
        }, [currentPage, user, statusFilter]
    )

    if (!organizerRegistrations) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const handleFilterChange = (key, value) => {
        setSearchParams(prev => {
            prev.set(key, value);
            return prev;
        });
    };
    return (
        <div className="space-y-6 w-full">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Đăng ký thành nhà tổ chức sự kiện
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi trạng thái hồ sơ đăng ký nhà tổ chức của bạn.
                    </p>
                </div>
                {
                    user.role.name == Role.USER &&
                    <Button
                        onClick={() => navigate(routes.createOrganizerRegistration)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Đăng ký mới
                    </Button>
                }
            </div>
            <div className="flex justify-end">
                <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                    {/* Filter code  */}
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <SelectValue placeholder="Trạng thái" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                        <SelectItem value={RegistrationStatus.PENDING}>Chờ duyệt</SelectItem>
                        <SelectItem value={RegistrationStatus.APPROVED}>Đã phê duyệt</SelectItem>
                        <SelectItem value={RegistrationStatus.REJECTED}>Từ chối</SelectItem>
                        <SelectItem value={RegistrationStatus.CANCELLED}>Đã hủy</SelectItem>
                    </SelectContent>
                </Select>

            </div>
            {/* Data Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">

                            <TableHead className="uppercase text-xs font-semibold">Tài khoản đăng ký</TableHead>
                            <TableHead className="uppercase text-xs font-semibold">Nhà tổ chức</TableHead>
                            <TableHead className="uppercase text-xs font-semibold">Loại hình</TableHead>
                            <TableHead className="uppercase text-xs font-semibold">Ngày gửi</TableHead>
                            <TableHead className="uppercase text-xs font-semibold">Trạng thái</TableHead>
                            {/* <TableHead className="text-right uppercase text-xs font-semibold">Hành động</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {organizerRegistrations.map((item) => (
                            <TableRow key={item.id} className="group hover:bg-muted/50">

                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <DefaultAvatar user={item.appUser} />
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">{item.appUser.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{item.appUser.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Avatar className="rounded-lg h-10 w-10">
                                            <AvatarImage
                                                src={item.businessAvatarUrl}
                                                alt={item.name} className="object-cover" />
                                        </Avatar>
                                        <span className="font-medium flex items-center gap-2">
                                            {item.businessName}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span>{item.type == OrganizerType.PERSONAL ? "Cá nhân" : "Tổ chức"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={item.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        navigate(routes.organizerRegistrationDetail.replace(":id", item.id))
                                                    }}
                                                >Xem chi tiết</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        navigate(routes.updateOrganizerRegistration.replace(":id", item.id))
                                                    }}
                                                >Chỉnh sửa</DropdownMenuItem>
                                                {/* <DropdownMenuItem>Gửi email</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Xóa yêu cầu</DropdownMenuItem> */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {
                organizerRegistrations.length > 0 &&
                <DefaultPagination
                    currentPage={currentPage}
                    setSearchParams={setSearchParams}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                />
            }




        </div >
    );
}