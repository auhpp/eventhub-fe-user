import React, { useContext, useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EventCard from '@/features/event/EventCard';
import { useSearchParams } from 'react-router-dom';
import { getEvents } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import DefaultPagination from '@/components/DefaultPagination';
import { AuthContext } from '@/context/AuthContex';
import { EventStatus, SortType } from '@/utils/constant';
import EmptyNotify from '@/components/EmptyNotify';

const EvenManagementPage = () => {
    const [events, setEvents] = useState(null)
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 8;
    const { user } = useContext(AuthContext)
    //  Filter States
    const statusFilter = searchParams.get("status") || "ALL";
    const sortType = searchParams.get("sortType") || SortType.NEWEST;

    const keyword = searchParams.get("name") || "";

    useEffect(
        () => {
            const fetchEvents = async () => {
                try {
                    if (user) {
                        const status = statusFilter == "ALL" ? null : statusFilter
                        const response = await getEvents({
                            request: {
                                userId: user.id,
                                status: status, sortType: sortType, name: keyword
                            }, page: currentPage, size: pageSize
                        })
                        if (response.code == HttpStatusCode.Ok) {
                            setEvents(response.result.data)
                            setTotalPages(response.result.totalPage);
                            setTotalElements(response.result.totalElements);
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            fetchEvents()
        }, [currentPage, user, keyword, sortType, statusFilter]
    )
    const handleFilterChange = (key, value) => {
        setSearchParams(prev => {
            if (value === "ALL" && key === "status") prev.delete(key);
            else if (!value) prev.delete(key);
            else prev.set(key, value);
            prev.set("page", "1");
            return prev;
        });
    };
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            handleFilterChange("name", e.target.value.trim())
        }
    };
    if (!events) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
            {/* Filters & Actions Bar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between
             items-center bg-card p-3 rounded-md border border-border/60 shadow-sm">
                {/* Search Input */}
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên..."
                        className="pl-9 bg-card"
                        defaultValue={keyword}
                        onKeyDown={handleSearch}
                    />
                </div>

                {/* Filters Select */}
                <div className="flex gap-3">
                    <Select defaultValue="ALL" value={statusFilter}
                        onValueChange={(val) => handleFilterChange("status", val)}>
                        <SelectTrigger className="w-[180px] bg-card">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value={EventStatus.PENDING}>Chờ duyệt</SelectItem>
                            <SelectItem value={EventStatus.APPROVED}>Đã phê duyệt</SelectItem>
                            <SelectItem value={EventStatus.REJECTED}>Đã bị từ chối</SelectItem>
                            <SelectItem value={EventStatus.CANCELLED}>Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue="newest" value={sortType}
                        onValueChange={(val) => handleFilterChange("sortType", val)}>
                        <SelectTrigger className="w-[160px] bg-card">
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={SortType.NEWEST}>Mới nhất</SelectItem>
                            <SelectItem value={SortType.OLDEST}>Cũ nhất</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Events Grid */}
            {
                events.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {
                                events.map((event) => (
                                    <EventCard key={event.id} event={event} showActionManage={true}

                                    />
                                ))
                            }
                        </div>
                    </>
                ) : (
                    <EmptyNotify title={"Không tìm thấy sự kiện"} />
                )
            }

            {/* Pagination */}
            {
                events.length > 0 &&
                <div className='mb-2'>
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={setSearchParams}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                </div>
            }

        </div>
    );
};

export default EvenManagementPage;