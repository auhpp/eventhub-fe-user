import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getEvents } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import EventCard from '@/features/event/EventCard';
import DefaultPagination from '@/components/DefaultPagination';
import FilterSidebar from './FilterSidebar';
import { EventStatus } from '@/utils/constant';
import { routes } from '@/config/routes';

const SearchEventPage = () => {
    const [events, setEvents] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 8;

    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true);
            try {
                const name = searchParams.get("name");
                const time = searchParams.get("time");
                const type = searchParams.get("type");
                const priceFrom = searchParams.get("priceFrom");
                const priceTo = searchParams.get("priceTo");
                const fromDate = searchParams.get("fromDate");
                const toDate = searchParams.get("toDate");

                const categoryIdStr = searchParams.get("categoryId");
                const categoryIds = categoryIdStr ? categoryIdStr.split(',').map(Number) : undefined;

                const requestPayload = {
                    status: EventStatus.APPROVED,
                    name: name || undefined,
                    categoryIds: categoryIds, 
                    thisWeek: time === 'thisWeek' ? true : undefined,
                    thisMonth: time === 'thisMonth' ? true : undefined,
                    type: type || undefined,
                    priceFrom: priceFrom ? Number(priceFrom) : undefined,
                    priceTo: priceTo ? Number(priceTo) : undefined,
                    fromDate: fromDate || undefined,
                    toDate: toDate || undefined,
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
    }, [searchParams]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8  min-h-screen">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/4 flex-shrink-0">
                    <FilterSidebar searchParams={searchParams} setSearchParams={setSearchParams} />
                </div>

                <div className="w-full md:w-3/4 flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {searchParams.get("name")
                                ? `Kết quả tìm kiếm cho "${searchParams.get("name")}"`
                                : "Khám phá sự kiện"}
                        </h1>
                        <p className="text-gray-500 mt-1">Tìm thấy {totalElements} sự kiện</p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 w-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : events?.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-8">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        showActionManage={false}
                                        userMode={true}
                                        onClick={() => navigate(routes.eventDetail.replace(":id", event.id))}
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
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 text-center px-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sự kiện nào</h3>
                            <p className="text-gray-500 max-w-sm">Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm để xem thêm nhiều kết quả khác nhé.</p>
                            <button
                                onClick={() => setSearchParams({})}
                                className="mt-6 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchEventPage;