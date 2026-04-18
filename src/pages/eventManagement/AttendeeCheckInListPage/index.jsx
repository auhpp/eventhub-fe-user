import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, MoreVertical } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DefaultPagination from '@/components/DefaultPagination';
import { getAttendeeCheckedIns } from '@/services/attendeeService';
import ButtonBack from '@/components/ButtonBack';
import DefaultAvatar from '@/components/DefaultAvatar';
import { routes } from '@/config/routes';
import { EventContext } from '@/context/EventContext';

const AttendeeCheckInList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const passedState = location.state;

    const { event } = useContext(EventContext)
    const eventSessionId = passedState?.eventSessionId;
    const ticketName = passedState?.ticketName;

    const navigate = useNavigate()

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const { ticketId } = useParams();
    const currentPage = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("size")) || 10;
    const keyword = searchParams.get("search") || "";

    const handleFilterChange = (key, value) => {
        setSearchParams(prev => {
            if (value.trim()) {
                prev.set(key, value.trim());
            } else {
                prev.delete(key);
            }
            prev.set("page", "1"); 
            return prev;
        });
    };

    const fetchAttendees = useCallback(async () => {
        if (!ticketId) return;

        try {
            const response = await getAttendeeCheckedIns({
                ticketId,
                email: keyword,
                page: currentPage,
                size: pageSize
            });

            setData(response.result.data || []);
            setTotalPages(response.totalPage || 1);
            setTotalElements(response.totalElements || 0);
        } catch (error) {
            console.error("Lỗi khi tải danh sách check-in:", error);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId, keyword, currentPage, pageSize]);

    useEffect(() => {
        fetchAttendees();
    }, [fetchAttendees]);

    const onViewDetail = (userId) => {
        navigate(routes.userBookingDetail.replace(":id", event.id).replace(":eventSessionId", eventSessionId)
            .replace(":userId", userId));
    };
    if (isLoading || !data) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div></div>;
    }
    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className='flex gap-3'>
                    <ButtonBack />
                    <h1 className="text-2xl font-bold text-gray-900">Danh sách Check-in vé: {ticketName}</h1>

                </div>

            </div>
            <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm theo email..."
                    className="pl-9"
                    defaultValue={keyword}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleFilterChange("search", e.currentTarget.value);
                        }
                    }}
                />
            </div>

            {/* data */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[40%]">Người tham gia</TableHead>
                            {/* <TableHead>Thông tin vé</TableHead> */}
                            <TableHead>Đã check-in</TableHead>
                            <TableHead className="text-right pr-4">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Không có dữ liệu phù hợp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => {
                                const user = {
                                    email: item.email,
                                    fullName: item.fullName,
                                    avatar: item?.avatar
                                }
                                return (
                                    <TableRow key={item.userId || index} className="group hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <DefaultAvatar user={user} />
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.fullName || 'Người dùng ẩn danh'}</p>
                                                    <p className="text-sm text-muted-foreground">{item.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium flex items-center gap-1 text-gray-700">
                                                    <Ticket size={14} className="text-blue-500" />
                                                    Vé sở hữu
                                                </span>
                                            </div>
                                        </TableCell> */}

                                        <TableCell className="text-sm font-medium text-gray-900">
                                            {item.checkedInCount || 0} vé
                                        </TableCell>

                                        <TableCell className="text-right pr-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onViewDetail(item.userId)}>
                                                        Xem chi tiết lịch sử
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>

                                )
                            }
                            )
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalElements > 0 && (
                <div className="pt-4">
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

export default AttendeeCheckInList;