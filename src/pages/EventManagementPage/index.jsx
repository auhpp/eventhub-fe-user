import React, { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EventCard from '@/features/event/EventCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getEventsCurrentUser } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import DefaultPagination from '@/components/DefaultPagination';
import { routes } from '@/config/routes';

const EvenManagementPage = () => {
    const [events, setEvents] = useState(null)
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 4;

    const navigate = useNavigate()

    useEffect(
        () => {
            const fetchEvents = async () => {
                try {
                    const response = await getEventsCurrentUser({ page: currentPage, size: pageSize })
                    if (response.code == HttpStatusCode.Ok) {
                        setEvents(response.result.data)
                        setTotalPages(response.result.totalPage);
                        setTotalElements(response.result.totalElements);
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            fetchEvents()
        }, [currentPage]
    )


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
             items-center bg-card p-3 rounded-2xl border border-border/60 shadow-sm">
                {/* Search Input */}
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên, email hoặc tổ chức..."
                        className="pl-9 bg-card"
                    />
                </div>

                {/* Filters Select */}
                <div className="flex gap-3">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[180px] bg-card">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                            <SelectItem value="approved">Đã phê duyệt</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue="newest">
                        <SelectTrigger className="w-[160px] bg-card">
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Mới nhất</SelectItem>
                            <SelectItem value="oldest">Cũ nhất</SelectItem>
                            <SelectItem value="az">A-Z</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} showActionManage={true}
                        onClick={() => navigate(routes.eventOverview.replace(":id", event.id))}
                    />
                ))}
            </div>

            {/* Pagination */}
            <DefaultPagination
                currentPage={currentPage}
                setSearchParams={setSearchParams}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
            />

        </div>
    );
};

export default EvenManagementPage;