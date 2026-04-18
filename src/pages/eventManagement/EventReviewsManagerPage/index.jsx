import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Loader2, Star, Search, Filter, MessageSquare,
    MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { getReviews, getReviewStats } from "@/services/reviewService";
import DefaultPagination from "@/components/DefaultPagination";
import DefaultAvatar from "@/components/DefaultAvatar";
import StarRating from "@/features/review/StarRating";
import SessionSelector from "@/components/SessionSelector";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventContext } from "@/context/EventContext";
import { routes } from "@/config/routes";

const EventReviewsManagerPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;
    const { event } = useContext(EventContext);
    const navigate = useNavigate();

    // Statesfor filters and session selection
    const currentSessionId = useMemo(() => {
        const idFromUrl = searchParams.get("sessionId");
        if (idFromUrl) return Number(idFromUrl);
        if (event?.eventSessions?.length > 0) return event.eventSessions[0].id;
        return null;
    }, [searchParams, event]);

    const ratingFilter = searchParams.get("rating") || "all";
    const emailFilter = searchParams.get("email") || "";

    const [searchTerm, setSearchTerm] = useState(emailFilter);

    // States data
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch data
    useEffect(() => {
        const fetchOrganizerReviews = async () => {
            if (!currentSessionId) return;

            try {
                const queryParams = {
                    page: currentPage,
                    size: pageSize,
                    eventSessionId: currentSessionId, 
                    ...(ratingFilter !== "all" && { rating: ratingFilter }),
                    ...(emailFilter && { email: emailFilter })
                };

                const [statsRes, reviewsRes] = await Promise.all([
                    getReviewStats({ eventId: event?.id, eventSessionId: currentSessionId }),
                    getReviews(queryParams)
                ]);

                const res = reviewsRes.result;
                setReviews(res.data || []);
                setTotalPages(res.totalPage || res.totalPages || 1);
                setTotalElements(res.totalElements || 0);
                setStats(statsRes.result);
            } catch (error) {
                console.error("Lỗi khi tải danh sách đánh giá:", error);
            } finally {
                setLoading(false);
            }
        };

        if (event?.id) {
            fetchOrganizerReviews();
        }
    }, [event?.id, currentSessionId, ratingFilter, emailFilter, currentPage]);

    // Handlers
    const handleSessionSelect = (sessionId) => {
        searchParams.set("sessionId", sessionId.toString());
        searchParams.set("page", "1");
        setSearchParams(searchParams);
    };

    const handleRatingChange = (value) => {
        if (value === "all") {
            searchParams.delete("rating");
        } else {
            searchParams.set("rating", value);
        }
        searchParams.set("page", "1");
        setSearchParams(searchParams);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            const currentEmail = searchParams.get("email") || "";
            if (searchTerm !== currentEmail) {
                if (searchTerm.trim()) {
                    searchParams.set("email", searchTerm.trim());
                } else {
                    searchParams.delete("email");
                }
                searchParams.set("page", "1"); 
                setSearchParams(searchParams);
            }
        }
    };

    const onViewDetail = (userId) => {
        navigate(routes.userBookingDetail
            .replace(":id", event.id)
            .replace(":eventSessionId", currentSessionId)
            .replace(":userId", userId)
        );
    };

    return (
        <div className="flex flex-col gap-4 p-6 bg-gray-50/50 dark:bg-gray-900/50 ">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Quản lý Đánh giá
                    </h2>
                    <p className="text-sm text-gray-500">
                        Theo dõi và phản hồi đánh giá từ người tham gia sự kiện.
                    </p>
                </div>

                {stats && (
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2 px-4 border-r border-gray-200 dark:border-gray-700">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <div>
                                <p className="text-lg font-bold leading-none">{stats.averageRating?.toFixed(1) || "0.0"}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-semibold">Điểm TB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-lg font-bold leading-none">{stats.totalReviews || 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-semibold">Đánh giá</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Selector */}
            <SessionSelector
                sessions={event?.eventSessions || []}
                selectedSessionId={currentSessionId}
                onSelect={handleSessionSelect}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex flex-1 items-center gap-3 w-full">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Nhập email và nhấn Enter..."
                                className="pl-9 bg-white dark:bg-gray-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchKeyDown} 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select value={ratingFilter} onValueChange={handleRatingChange}>
                            <SelectTrigger className="w-[140px] bg-white dark:bg-gray-900">
                                <SelectValue placeholder="Mức đánh giá" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Mọi đánh giá</SelectItem>
                                <SelectItem value="5">5 Sao</SelectItem>
                                <SelectItem value="4">4 Sao</SelectItem>
                                <SelectItem value="3">3 Sao</SelectItem>
                                <SelectItem value="2">2 Sao</SelectItem>
                                <SelectItem value="1">1 Sao</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* data */}
                <div className="relative">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Filter className="w-10 h-10 mb-2 text-gray-300" />
                            <p>Không tìm thấy đánh giá nào phù hợp với bộ lọc.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/80 dark:bg-gray-900/80">
                                <TableRow>
                                    <TableHead className="w-[250px]">Người đánh giá</TableHead>
                                    <TableHead className="w-[150px]">Đánh giá</TableHead>
                                    <TableHead>Nội dung</TableHead>
                                    <TableHead className="w-[180px]">Thời gian</TableHead>
                                    <TableHead className="w-[80px] text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviews.map((review) => (
                                    <TableRow key={review.id} className="group">
                                        {/* User Info */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-gray-200">
                                                    <DefaultAvatar user={review.user} />
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                        {review.user?.fullName || "Người dùng ẩn danh"}
                                                    </span>
                                                    <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                        {review.user?.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Rating */}
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <StarRating rating={review.rating} readonly size="w-3.5 h-3.5" />
                                                {review.rating >= 4 ? (
                                                    <Badge variant="success" className="w-fit text-[10px] bg-green-100 text-green-700 hover:bg-green-100 border-none">Tích cực</Badge>
                                                ) : review.rating <= 2 ? (
                                                    <Badge variant="destructive" className="w-fit text-[10px] bg-red-100 text-red-700 hover:bg-red-100 border-none">Tiêu cực</Badge>
                                                ) : null}
                                            </div>
                                        </TableCell>

                                        {/* Content */}
                                        <TableCell>
                                            <div className="max-w-md">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2" title={review.comment}>
                                                    {review.comment || <span className="text-gray-400 italic">Không có bình luận</span>}
                                                </p>
                                                {review.reviewImages?.length > 0 && (
                                                    <div className="flex gap-1 mt-2">
                                                        {review.reviewImages.slice(0, 3).map((img, idx) => (
                                                            <img key={idx} src={img.imageUrl} alt="Đính kèm" className="h-8 w-8 rounded object-cover border border-gray-200" />
                                                        ))}
                                                        {review.reviewImages.length > 3 && (
                                                            <span className="flex items-center justify-center h-8 w-8 rounded bg-gray-100 text-xs text-gray-500 border border-gray-200">
                                                                +{review.reviewImages.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="text-sm text-gray-500">
                                            {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: vi })}
                                            <br />
                                            <span className="text-xs">{format(new Date(review.createdAt), "HH:mm")}</span>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => onViewDetail(review.user.id)}>
                                                        Xem lịch sử mua vé
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination */}
                {totalElements > pageSize && !loading && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
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
        </div>
    );
};

export default EventReviewsManagerPage;