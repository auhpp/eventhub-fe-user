import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
    Filter, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";
import { formatDate, formatTime } from "@/utils/format";
import { getEventById } from "@/services/eventService";
import { filterResalePosts } from "@/services/resalePostService";
import DefaultPagination from "@/components/DefaultPagination";
import EventHero from "../EventDetailPage/EventHero";
import EventResaleTicketCard from "@/features/resale/EventResaleTicketCard";
import { ResalePostStatus, SortType } from "@/utils/constant";
import { HttpStatusCode } from "axios";


const EventResalePage = () => {
    const { eventId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [event, setEvent] = useState(null);
    const [resalePosts, setResalePosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingPosts, setIsFetchingPosts] = useState(false);

    // States Pagination
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 12;
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // States for Filters
    const [filterSort, setFilterSort] = useState(SortType.NEWEST);
    const [filterQuantity, setFilterQuantity] = useState("");
    const [filterSession, setFilterSession] = useState("ALL");
    const [filterTicket, setFilterTicket] = useState("ALL");
    const [filterRetail, setFilterRetail] = useState("ALL");

    // 1. Fetch Event Info 
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await getEventById({ id: eventId });
                if (res.code == HttpStatusCode.Ok) setEvent(res.result);
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                toast.error("Không thể tải thông tin sự kiện");
            }
        };
        if (eventId) fetchEvent();
    }, [eventId]);

    // 2. get resale posts
    const fetchPosts = async () => {
        setIsFetchingPosts(true);
        try {
            const data = await filterResalePosts({
                sortType: filterSort !== SortType.NEWEST ? filterSort : null,
                quantity: filterQuantity ? parseInt(filterQuantity) : null,
                eventSessionId: filterSession === "ALL" ? null : filterSession,
                eventId: filterSession === "ALL" ? eventId : null,
                ticketId: filterTicket === "ALL" ? null : filterTicket,
                hasRetail: filterRetail === "ALL" ? null : (filterRetail === "RETAIL"),
                statuses: [ResalePostStatus.APPROVED],
                page: currentPage,
                size: pageSize
            });

            if (data.result) {
                setResalePosts(data.result.data || []);
                setTotalPages(data.result.totalPage || 1);
                setTotalElements(data.result.totalElements || 0);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Lỗi khi tải danh sách vé bán lại");
        } finally {
            setIsFetchingPosts(false);
            setIsLoading(false);
        }
    };

    // fetch data when current page change
    useEffect(() => {
        fetchPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, eventId]);

    // handle when click filter button
    const handleApplyFilter = () => {
        if (currentPage !== 1) {
            setSearchParams({ page: "1" });
        } else {
            fetchPosts();
        }
    };

    // Handle when clicl "Thiết lập lại"
    const handleResetFilter = () => {
        setFilterSort(SortType.NEWEST);
        setFilterQuantity("");
        setFilterSession("ALL");
        setFilterTicket("ALL");
        setFilterRetail("ALL");
        if (currentPage !== 1) setSearchParams({ page: "1" });
        else setTimeout(() => handleApplyFilter(), 0);
    };

    // Handle dropdown Ticket 
    const availableTickets = event?.eventSessions?.find(s => s.id.toString() === filterSession)?.tickets ||
        event?.eventSessions?.flatMap(s => s.tickets) || [];

    const uniqueTickets = Array.from(new Map(availableTickets.map(t => [t.name, t])).values());

    if (isLoading && !event) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {event && <EventHero event={event} isResale={true} />}

                {/* Resale */}
                <div className="mb-6 flex items-center justify-between mt-8">
                    {/* Head */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Danh sách vé bán lại</h2>
                        <p className="text-slate-500 mt-1">Tìm thấy {totalElements} bài đăng đang bán</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">

                    {/* Left column: filter */}
                    <div className="w-full lg:w-1/4 shrink-0">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                            <div className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800">
                                <Filter className="w-5 h-5" /> Bộ lọc
                            </div>

                            <div className="space-y-6">
                                {/* Sort type */}
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">Sắp xếp</Label>
                                    <RadioGroup value={filterSort} onValueChange={setFilterSort} className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="NEWEST" id="sort-new" />
                                            <Label htmlFor="sort-new" className="text-slate-600 font-normal">
                                                Tin đăng mới nhất</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="PRICE_LOWEST" id="sort-asc" />
                                            <Label htmlFor="sort-asc" className="text-slate-600 font-normal">
                                                Giá từ thấp đến cao</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="PRICE_HIGHEST" id="sort-desc" />
                                            <Label htmlFor="sort-desc" className="text-slate-600 font-normal">
                                                Giá từ cao đến thấp</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                {/* ticket quantity */}
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Số lượng vé cần mua</Label>
                                    <Input
                                        type="number"
                                        placeholder="VD: 1, 2, 5..."
                                        min="1"
                                        value={filterQuantity}
                                        onChange={(e) => setFilterQuantity(e.target.value)}
                                        className="bg-slate-50"
                                    />
                                </div>

                                {/* session */}
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Khung giờ</Label>
                                    <Select value={filterSession} onValueChange={(val) => {
                                        setFilterSession(val);
                                        setFilterTicket("ALL");
                                    }}>
                                        <SelectTrigger className="bg-slate-50">
                                            <SelectValue placeholder="Chọn khung giờ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả khung giờ</SelectItem>
                                            {event?.eventSessions?.map(session => (
                                                <SelectItem key={session.id} value={session.id.toString()}>
                                                    {formatTime(session.startDateTime)} - {formatDate(session.startDateTime)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* ticket */}
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Loại vé</Label>
                                    <Select value={filterTicket} onValueChange={setFilterTicket}
                                        disabled={uniqueTickets.length === 0}>
                                        <SelectTrigger className="bg-slate-50">
                                            <SelectValue placeholder="Chọn loại vé" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả loại vé</SelectItem>
                                            {uniqueTickets.map(ticket => (
                                                <SelectItem key={ticket.id} value={ticket.id.toString()}>
                                                    {ticket.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Form of sale */}
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">Hình thức bán</Label>
                                    <RadioGroup value={filterRetail} onValueChange={setFilterRetail} className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="ALL" id="retail-all" />
                                            <Label htmlFor="retail-all" className="text-slate-600 font-normal">Tất cả</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="RETAIL" id="retail-yes" />
                                            <Label htmlFor="retail-yes" className="text-slate-600 font-normal">Có bán lẻ</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="COMBO" id="retail-no" />
                                            <Label htmlFor="retail-no" className="text-slate-600 font-normal">Không bán lẻ</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Buttons Action */}
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <Button variant="outline" className="flex-1 text-slate-600" onClick={handleResetFilter}>
                                        Thiết lập lại
                                    </Button>
                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleApplyFilter}>
                                        Áp dụng
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* right column: ticket list */}
                    <div className="flex-1 min-w-0">
                        {isFetchingPosts ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-xl"></div>
                                ))}
                            </div>
                        ) : resalePosts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                                    {resalePosts.map((post) => (
                                        <EventResaleTicketCard key={post.id} post={post} event={event} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
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
                            /* State for don't have data */
                            <div className="flex flex-col items-center justify-center bg-white py-20 rounded-xl border 
                            border-slate-200 border-dashed">
                                <Search className="w-12 h-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700">Không tìm thấy vé bán lại</h3>
                                <p className="text-slate-500 max-w-sm text-center mt-2 mb-6">
                                    Hiện tại chưa có ai đăng bán lại vé phù hợp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc
                                    hoặc quay lại sau nhé.
                                </p>
                                <Button variant="outline" onClick={handleResetFilter}>Xóa bộ lọc</Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventResalePage;