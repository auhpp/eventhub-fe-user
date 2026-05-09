import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/context/AuthContex';
import { getReviews } from '@/services/reviewService';
import { getReviewSummary } from '@/services/statsService';
import StarRating from '@/features/review/StarRating';
import ReviewItem from '@/features/review/ReviewItem';
import DefaultPagination from '@/components/DefaultPagination';

const OrganizerReviewsPage = () => {
    const { organizerId } = useParams(); 
    const { user: currentUser } = useContext(AuthContext);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 10; 

    // States
    const [summary, setSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null); 

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Loading states
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);

    // 1. Fetch Summary
    useEffect(() => {
        const fetchSummary = async () => {
            console.log("Fetching review summary for organizerId:", organizerId);
            if (!organizerId) return;
            try {
                const res = await getReviewSummary({ organizerId });
                setSummary(res.result);
            } catch (error) {
                console.error("Lỗi khi tải thống kê đánh giá", error);
            } finally {
                setIsLoadingSummary(false);
            }
        };
        fetchSummary();
    }, [organizerId]);

    // 2. Fetch Reviews 
    useEffect(() => {
        const fetchReviewsData = async () => {
            if (!organizerId) return;
            try {
                setIsLoadingReviews(true);
                const res = await getReviews({
                    organizerId,
                    rating: selectedRating, 
                    page: currentPage,
                    size: pageSize
                });

                const fetchedData = res.result?.data || [];

                setReviews(fetchedData);
                setTotalPages(res.result?.totalPage || 1);
                setTotalElements(res.result?.totalElements || 0);

            } catch (error) {
                console.error("Lỗi tải danh sách review", error);
            } finally {
                setIsLoadingReviews(false);
            }
        };

        fetchReviewsData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [organizerId, selectedRating, currentPage]);

    const handleFilterChange = (ratingValue) => {
        if (selectedRating === ratingValue) return;
        setSelectedRating(ratingValue);

        searchParams.set("page", "1");
        setSearchParams(searchParams);
    };

    const getCountForRating = (starLevel) => {
        if (!summary || !summary.ratings) return 0;
        const found = summary.ratings.find(r => r.rating === starLevel);
        return found ? found.count : 0;
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Đánh giá Nhà tổ chức</h1>

            {/* --- SECTION: SUMMARY --- */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-center">
                {isLoadingSummary ? (
                    <div className="w-full flex justify-center py-6"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : summary ? (
                    <>
                        <div className="flex flex-col items-center justify-center min-w-[150px]">
                            <span className="text-5xl font-extrabold text-slate-900">
                                {Number(summary.averageRating || 0).toFixed(1)}
                            </span>
                            <div className="my-2">
                                <StarRating rating={Math.round(summary.averageRating || 0)} readonly size="w-5 h-5" />
                            </div>
                            <span className="text-sm text-slate-500">
                                Dựa trên {summary.totalReview || 0} đánh giá
                            </span>
                        </div>

                        <div className="hidden md:block w-px bg-slate-200 h-24"></div>

                        <div className="flex-1 w-full space-y-2">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = getCountForRating(star);
                                const total = summary.totalReview || 1;
                                const percentage = (count / total) * 100;

                                return (
                                    <div key={star} className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1 w-12 text-slate-600 font-medium">
                                            {star} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-10 text-right text-slate-500">
                                            {count}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <p className="text-slate-500">Chưa có dữ liệu đánh giá.</p>
                )}
            </div>

            {/* --- SECTION: FILTER --- */}
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="mr-2 font-medium text-slate-700 py-2">Lọc theo:</span>

                <Button
                    variant={selectedRating === null ? "default" : "outline"}
                    onClick={() => handleFilterChange(null)}
                    className="rounded-full"
                >
                    Tất cả
                </Button>

                {[5, 4, 3, 2, 1].map(star => (
                    <Button
                        key={star}
                        variant={selectedRating === star ? "default" : "outline"}
                        onClick={() => handleFilterChange(star)}
                        className="rounded-full flex items-center gap-1"
                    >
                        {star} Sao
                    </Button>
                ))}
            </div>

            {/* --- SECTION: REVIEW LIST--- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                {isLoadingReviews ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        Chưa có đánh giá nào {selectedRating ? `ở mức ${selectedRating} sao` : ''}.
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {reviews.map(review => (
                            <ReviewItem
                                key={review.id}
                                review={review}
                                currentUserId={currentUser?.id}
                                showEvent={true}
                            />
                        ))}
                    </div>
                )}

                {/* --- Pagination --- */}
                {!isLoadingReviews && totalPages > 1 && (
                    <div className="mt-8">
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

export default OrganizerReviewsPage;