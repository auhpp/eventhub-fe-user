import React, { useState, useEffect } from 'react';
import { ThumbsUp, User, Clock, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { deleteQuestion, upvoteQuestion } from '@/services/questionService';
import { Avatar } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';
import QuestionNote from './QuestionNote';
import QuestionNoteList from './QuestionNoteList';
import { QuestionStatus } from '@/utils/constant';
import QuestionStatusBadge from '@/components/QuestionStatusBadge';

const QuestionItem = ({ question, currentUserId, onOptimisticUpvote, onDeleteSuccess }) => {
    const isMyQuestion = question.appUser?.id === currentUserId;
    const isAnonymous = question.hasAnonymous;

    const displayName = isAnonymous ? "Người tham gia ẩn danh" : (question.appUser?.fullName || "Người tham gia");
    const displayAvatar = !isAnonymous ? question.appUser : null;

    const [isUpVoted, setIsUpVoted] = useState(question.upVoted || false);
    const [localUpvoteCount, setLocalUpvoteCount] = useState(question.upvoteCount || 0);
    const [isVoting, setIsVoting] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const canDelete = isMyQuestion && (question.status === QuestionStatus.PENDING);
    const canTakeNote = question.status === QuestionStatus.REPLYING || question.status === QuestionStatus.PINNED;

    useEffect(() => {
        setLocalUpvoteCount(question.upvoteCount || 0);
        if (question.upVoted !== undefined && currentUserId == question.actionUserId) {
            setIsUpVoted(question.upVoted);
        }
    }, [question.upvoteCount, question.upVoted, question.actionUserId, currentUserId]);

    const handleUpvoteClick = async () => {
        if (isVoting) return;
        setIsVoting(true);

        const newUpvotedState = !isUpVoted;
        const newCount = newUpvotedState ? localUpvoteCount + 1 : localUpvoteCount - 1;

        setIsUpVoted(newUpvotedState);
        setLocalUpvoteCount(newCount);

        if (onOptimisticUpvote) {
            onOptimisticUpvote(question.id, newCount, newUpvotedState);
        }

        try {
            await upvoteQuestion({ id: question.id });
        } catch (error) {
            console.error("Lỗi khi upvote:", error);
            setIsUpVoted(!newUpvotedState);
            const rollbackCount = newUpvotedState ? newCount - 1 : newCount + 1;
            setLocalUpvoteCount(rollbackCount);

            if (onOptimisticUpvote) {
                onOptimisticUpvote(question.id, rollbackCount, !newUpvotedState);
            }
            toast.error("Có lỗi xảy ra, không thể ghi nhận lượt bình chọn!");
        } finally {
            setIsVoting(false);
        }
    };

    const handleDeleteClick = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) return;

        setIsDeleting(true);
        try {
            await deleteQuestion({ id: question.id });
            toast.success("Đã xóa câu hỏi thành công");
            if (onDeleteSuccess) onDeleteSuccess(question.id);
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            toast.error("Không thể xóa câu hỏi. Vui lòng thử lại!");
            setIsDeleting(false);
        }
    };

    return (
        <div className={cn(
            "p-4 rounded-xl border mb-3 transition-all relative overflow-hidden",
            question.status === QuestionStatus.PENDING ? "bg-amber-50/30 border-amber-200" :
                question.status === QuestionStatus.REPLYING ? "bg-blue-50/80 border-blue-400 shadow-md ring-1 ring-blue-400" :
                    question.status === QuestionStatus.PINNED ? "bg-indigo-50/50 border-indigo-200 shadow-sm" :
                        question.status === QuestionStatus.REJECTED ? "bg-white opacity-60 grayscale" : "bg-white border-slate-100 shadow-sm"
        )}>
            {question.status === QuestionStatus.REPLYING && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 animate-pulse"></div>}
            {question.status === QuestionStatus.PINNED && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>}

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                        {displayAvatar ? (
                            <Avatar>
                                <DefaultAvatar user={displayAvatar} />
                            </Avatar>
                        ) : (
                            <User className="w-4 h-4 text-slate-400" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{displayName}</span>
                            {isMyQuestion && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700">Bạn</Badge>}

                            <span className="text-sm text-slate-800 bg-slate-100 px-1 rounded">#{question.id}</span>

                        </div>
                        <div className="flex items-center text-[11px] text-slate-500 gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: vi })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <QuestionStatusBadge status={question.status} />

                    {canDelete && (
                        <button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className={cn(
                                "flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-1",
                                isDeleting && "opacity-50 cursor-not-allowed"
                            )}
                            title="Xóa câu hỏi"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <p className="text-slate-700 text-sm md:text-base mt-2 whitespace-pre-wrap leading-relaxed">
                {question.content}
            </p>
            <QuestionNote
                questionId={question.id}
                isVisible={canTakeNote}
            />
            <QuestionNoteList
                questionId={question.id}
                userId={currentUserId}
            />
            <div className="mt-3 flex items-center justify-end">
                <button
                    onClick={handleUpvoteClick}
                    disabled={![QuestionStatus.APPROVED, QuestionStatus.PINNED].includes(question.status)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        ![QuestionStatus.APPROVED, QuestionStatus.PINNED].includes(question.status) ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400" :
                            isUpVoted ? "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200" :
                                "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm"
                    )}
                >
                    <ThumbsUp className={cn("w-4 h-4", isUpVoted && "fill-blue-600 text-blue-600")} />
                    <span>{localUpvoteCount}</span>
                </button>
            </div>
        </div>
    );
};

export default QuestionItem;