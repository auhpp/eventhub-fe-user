// src/pages/EventDetail/EventReviewsTab.jsx
import React, { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, MessageSquareOff, Star } from "lucide-react";

import { getReviews, getReviewStats } from "@/services/reviewService";
import { AuthContext } from "@/context/AuthContex";
import SessionSelector from "@/components/SessionSelector";
import StarRating from "@/features/review/StarRating";
import ReviewItem from "@/features/review/ReviewItem";
import DefaultPagination from "@/components/DefaultPagination";

const EventReviewsTab = ({ event }) => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;

    const [currentSessionId, setCurrentSessionId] = useState(
        event.eventSessions?.[0]?.id || null
    );
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!currentSessionId) return;

        const fetchReviews = async () => {
            setLoading(true);
            try {
                const [statsRes, reviewsRes] = await Promise.all([
                    getReviewStats({eventSessionId: currentSessionId}),
                    getReviews({ eventSessionId: currentSessionId, page: currentPage, size: pageSize })
                ]);

                setStats(statsRes.result);

                const res = reviewsRes.result;
                setReviews(res.data || []);
                setTotalPages(res.totalPages || 1);
                setTotalElements(res.totalElements || 0);

                setStats(prev => ({ ...prev, totalReviews: res.totalElements || 0 }));
            } catch (error) {
                console.error("Lỗi khi tải đánh giá:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [currentSessionId, currentPage]);

    const handleSessionChange = (sessionId) => {
        setCurrentSessionId(sessionId);
        searchParams.set("page", "1");
        setSearchParams(searchParams);
    };

    const handleEditClick = (review) => {
        console.log("Đang chỉnh sửa đánh giá:", review);
    };
    if (!stats) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Star className="text-yellow-400 fill-yellow-400" /> Đánh giá từ người tham gia
            </h3>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* left column: filter and stats */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    {/* Session Selector */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Chọn khung giờ:</h4>
                        <SessionSelector
                            sessions={event.eventSessions}
                            selectedSessionId={currentSessionId}
                            onSelect={handleSessionChange}
                        />
                    </div>

                    {/* stats */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-5xl font-bold text-gray-900 dark:text-white">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div className="flex flex-col gap-1">
                                <StarRating rating={stats.averageRating} readonly size="w-5 h-5" />
                                <span className="text-sm text-gray-500">
                                    Dựa trên {stats.totalReviews} đánh giá
                                </span>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="flex flex-col gap-2">
                            {stats.breakdown.map((item) => (
                                <div key={item.stars} className="flex items-center gap-3 text-sm">
                                    <span className="w-12 text-gray-600 dark:text-gray-400 shrink-0">
                                        {item.stars} sao
                                    </span>
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${item.percent}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-gray-500 text-xs">
                                        {item.percent}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* right column: review list */}
                <div className="w-full lg:w-2/3 flex flex-col min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-gray-500">Đang tải đánh giá...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 space-y-3 text-gray-400 bg-gray-50
                         dark:bg-gray-800/30 rounded-xl p-8 border border-dashed border-gray-200 dark:border-gray-800">
                            <MessageSquareOff className="w-12 h-12 text-gray-300" />
                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Chưa có đánh giá nào</p>
                            <p className="text-sm">Hãy là người đầu tiên để lại đánh giá cho khung giờ này.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {reviews.map((review) => (
                                <ReviewItem
                                    key={review.id}
                                    review={review}
                                    currentUserId={user?.id}
                                    onEditClick={handleEditClick}
                                />
                            ))}

                            {totalElements > pageSize && (
                                <div className="mt-8 pt-6">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventReviewsTab;