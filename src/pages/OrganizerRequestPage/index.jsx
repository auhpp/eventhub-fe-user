import React, { useState, useEffect, useContext } from "react";
import {
    PlusCircle,
    Loader2,
    MoreVertical,
    IdCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "@/config/routes";
import { getOrganizerRegistrations } from "@/services/organizerRegistrationService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { AuthContext } from "@/context/AuthContex";
import { Role } from "@/utils/constant";
import DefaultPagination from "@/components/DefaultPagination";
import { HttpStatusCode } from "axios";


export default function OrganizerRequestPage() {
    const [organizerRegistrations, setOrganizerRegistrations] = useState(null)
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 2;
    useEffect(
        () => {
            const fetchorganizerRegistrations = async () => {
                try {
                    const response = await getOrganizerRegistrations({ page: currentPage, size: pageSize })
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
        }, [currentPage]
    )

    if (!organizerRegistrations) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }


    return (
        <div className="space-y-6 w-full">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Yêu cầu Đăng ký Ban Tổ chức
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi trạng thái hồ sơ đối tác của doanh nghiệp bạn.
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


            {/* Data Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="uppercase text-xs font-semibold">Người đăng ký</TableHead>
                            <TableHead className="uppercase text-xs font-semibold">Tổ chức / Doanh nghiệp</TableHead>
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
                                            <AvatarImage src={item.appUser?.avatar} alt={item.representativeFullName} />
                                            <AvatarFallback>{item.representativeFullName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">{item.representativeFullName}</p>
                                            <p className="text-sm text-muted-foreground">{item.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium flex items-center gap-2">
                                            {item.businessName}
                                        </span>
                                        {/* <span className="text-sm text-muted-foreground">ID: #{item.id.toString().padStart(6, '0')}</span> */}
                                    </div>
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
            <DefaultPagination
                currentPage={currentPage}
                setSearchParams={setSearchParams}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
            />




        </div >
    );
}