import React from 'react';
import StarRating from './StarRating'; 
import { differenceInDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DefaultAvatar from '@/components/DefaultAvatar';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit2, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewItem = ({ review, currentUserId, onEditClick, showEvent = false }) => {
    const daysSinceCreated = differenceInDays(new Date(), new Date(review.createdAt));
    const isOwner = currentUserId === review?.user?.id;
    const canEditReview = isOwner && review.editCount === 0 && daysSinceCreated <= 7;

    return (
        <div className="py-5 border-b border-slate-100 last:border-0">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Avatar>
                            <DefaultAvatar user={review.user} />
                        </Avatar>

                        <div>
                            <p className="font-semibold text-sm text-slate-900">
                                {review.user?.fullName ?? review.user?.email ?? "Người dùng ẩn danh"}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500">
                                    {review.createdAt ? format(new Date(review.createdAt), "dd MMM yyyy 'lúc' HH:mm", { locale: vi }) : ''}
                                </p>
                                {(review.editCount > 0) && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm">
                                        Đã chỉnh sửa
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} readonly size="w-4 h-4" />

                    {/* edit button */}
                    {canEditReview && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditClick(review)}
                            className="h-8 w-8 text-slate-400 hover:text-primary group-hover:opacity-100 transition-opacity"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {review.comment && (
                <p className="text-slate-700 text-sm mt-3 leading-relaxed whitespace-pre-wrap">
                    {review.comment}
                </p>
            )}

            {review.reviewImages && review.reviewImages.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {review.reviewImages.map((img) => (
                        <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={img.imageUrl}
                                alt="Review attachment"
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:opacity-90 transition-opacity cursor-zoom-in shrink-0"
                            />
                        </a>
                    ))}
                </div>
            )}

            {review.eventId && showEvent && (
                <Link
                    to={`/event/${review.eventId}`}
                    className="mt-4 flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group cursor-pointer w-fit pr-6"
                >
                    <img
                        src={review.thumbnailUrl || '/placeholder-event.jpg'}
                        alt={review.eventName}
                        className="w-14 h-14 object-cover rounded-md border border-slate-200"
                    />
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {review.eventName}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>
                                {review.startDateTime
                                    ? format(new Date(review.startDateTime), "dd/MM/yyyy HH:mm")
                                    : 'Chưa cập nhật thời gian'}
                            </span>
                        </div>
                    </div>
                </Link>
            )}

            {review.replyMessage && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 ml-4 relative
                 before:absolute before:left-0 before:top-0 before:w-1 before:h-full 
                 before:-ml-4 before:bg-slate-200 before:rounded-full">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-800">
                            Phản hồi từ Nhà tổ chức
                        </span>
                        {review.replyAt && (
                            <span className="text-xs text-slate-500">
                                {format(new Date(review.replyAt), "dd MMM yyyy 'lúc' HH:mm", { locale: vi })}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {review.replyMessage}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewItem;