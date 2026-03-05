import React, { useEffect, useState } from 'react';
import { getReviews } from '@/services/reviewService';
import ReviewItem from './ReviewItem';
import ReviewFormDialog from './ReviewFormDialog';
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Loader2 } from 'lucide-react';

const ReviewSection = ({ eventSessionId, attendeeId, currentUserId, canReview = true }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchReviews = async (pageNum = 1, isAppend = false) => {
        try {
            setIsLoading(true);
            const response = await getReviews({ eventSessionId: eventSessionId, userId: currentUserId, page: pageNum, size: 5 });

            if (isAppend) {
                setReviews(prev => [...prev, ...response.result.data]); 
            } else {
                setReviews(response.result.data);
            }
            setHasMore(pageNum < response.totalPages);
        } catch (error) {
            console.error("Lỗi khi tải đánh giá", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (eventSessionId) {
            fetchReviews();
        }
    }, [eventSessionId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage, true);
    };
    const handleOpenEditForm = (review) => {
        setEditingReview(review);
        setIsDialogOpen(true);
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Đánh giá sự kiện</h2>
                </div>
                {canReview && reviews.length == 0 && (
                    <Button onClick={() => setIsDialogOpen(true)}
                        className="bg-primary hover:bg-primary-700 text-white">
                        <MessageSquarePlus className="w-4 h-4 mr-2" />
                        Viết đánh giá
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                {reviews.length === 0 && !isLoading ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <p className="text-slate-500 text-sm">Chưa có đánh giá nào cho phiên sự kiện này.</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <ReviewItem key={review.id} review={review} currentUserId={currentUserId}
                            onEditClick={handleOpenEditForm} />
                    ))
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
            )}

            {hasMore && !isLoading && (
                <div className="text-center mt-6">
                    <Button variant="outline" onClick={handleLoadMore}>Xem thêm đánh giá</Button>
                </div>
            )}

            <ReviewFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                eventSessionId={eventSessionId}
                attendeeId={attendeeId}
                initialData={editingReview}
                onSuccess={() => {
                    setPage(1);
                    fetchReviews(1, false);
                }}
            />
        </div>
    );
};

export default ReviewSection;