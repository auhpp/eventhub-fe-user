import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from 'lucide-react';
import { getReviewSummary } from '@/services/statsService';

export default function OrganizerReviewWidget({ filters, refresh, organizerId, eventSeriesId }) {
    const [reviewData, setReviewData] = useState(null);

    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                if (!organizerId && !eventSeriesId) return;
                const data = await getReviewSummary({ eventSeriesId, organizerId, ...filters });
                setReviewData(data.result || data);
            } catch (error) {
                console.error("Lỗi tải tóm tắt đánh giá:", error);
            }
        };
        fetchReviewData();
    }, [filters, refresh, organizerId, eventSeriesId]);

    // Format ratings array to ensure 5 to 1 stars exist even if count is 0
    const formattedRatings = [5, 4, 3, 2, 1].map(star => {
        const found = reviewData?.ratings?.find(r => r.rating === star);
        return { rating: star, count: found ? found.count : 0 };
    });

    const totalReviews = reviewData?.totalReview || 0;
    const avgRating = reviewData?.averageRating?.toFixed(1) || "0.0";

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Tổng Quan Đánh Giá</CardTitle>
                <CardDescription>Phản hồi từ khách tham dự</CardDescription>
            </CardHeader>
            <CardContent>
                {reviewData ? (
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                            {avgRating} <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Dựa trên {totalReviews} đánh giá</p>

                        <div className="w-full space-y-3">
                            {formattedRatings.map((item) => {
                                const percentage = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
                                return (
                                    <div key={item.rating} className="flex items-center gap-2 text-sm">
                                        <div className="w-12 flex items-center gap-1 font-medium text-gray-600">
                                            {item.rating} <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
                                        </div>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-10 text-right text-gray-500">{item.count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">Đang tải...</div>
                )}
            </CardContent>
        </Card>
    );
}