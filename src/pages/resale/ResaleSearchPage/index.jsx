import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { getEvents } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import EventCard from '@/features/event/EventCard';
import DefaultPagination from '@/components/DefaultPagination';
import { routes } from '@/config/routes';
import { Input } from '@/components/ui/input';

const ResaleSearchPage = () => {
    const [events, setEvents] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 8;
    const keyword = searchParams.get("name") || "";

    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true);
            try {

                const requestPayload = {
                    name: keyword == "" ? null : keyword,
                    hasResale: true
                };

                const response = await getEvents({
                    request: requestPayload,
                    page: currentPage,
                    size: pageSize
                });

                if (response.code === HttpStatusCode.Ok) {
                    setEvents(response.result.data);
                    setTotalPages(response.result.totalPage);
                    setTotalElements(response.result.totalElements);
                }
            } catch (error) {
                console.error("Lỗi khi tìm kiếm:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [keyword, currentPage, pageSize]);

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
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8  min-h-screen">
            <div className="flex flex-col md:flex-row gap-8">

                <div className="w-full flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {searchParams.get("name")
                                ? `Kết quả tìm kiếm cho "${searchParams.get("name")}"`
                                : "Vé bán lại"}
                        </h1>
                        <p className="text-gray-500 mt-1">Tìm thấy {totalElements} sự kiện</p>
                    </div>
                    <div className="relative w-full sm:w-[400px] mb-6">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên sự kiện ..."
                            className="pl-9"
                            defaultValue={keyword}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilterChange("name", e.currentTarget.value);
                                }
                            }}
                        />
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 w-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : events?.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        showActionManage={false}
                                        userMode={true}
                                        onClick={() => navigate(routes.resaleEvent.replace(":eventId", event.id))}
                                        showPrice={false}
                                    />
                                ))}
                            </div>

                            {totalPages >= 1 && (
                                <DefaultPagination
                                    currentPage={currentPage}
                                    setSearchParams={setSearchParams}
                                    totalPages={totalPages}
                                    totalElements={totalElements}
                                    pageSize={pageSize}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm 
                        border border-gray-100 text-center px-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sự kiện nào</h3>
                            <p className="text-gray-500 max-w-sm">Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm để
                                xem thêm nhiều kết quả khác nhé.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResaleSearchPage;