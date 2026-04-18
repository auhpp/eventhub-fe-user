import React, { useState } from 'react';
import { User, Clock, ThumbsUp, Check, X, Pin, PinOff, CheckCircle2, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';
import { QuestionStatus } from '@/utils/constant';
import QuestionStatusBadge from '@/components/QuestionStatusBadge';

const OrganizerQuestionItem = ({ question, onUpdateStatus }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const isAnonymous = question.hasAnonymous;
    const displayName = isAnonymous ? "Người tham gia ẩn danh" : (question.appUser?.fullName || "Người tham gia");
    const displayAvatar = !isAnonymous ? question.appUser : null;

    const handleAction = async (newStatus) => {
        setIsProcessing(true);
        await onUpdateStatus(question, newStatus);
        setIsProcessing(false);
    };

    return (
        <div className={cn(
            "p-4 rounded-xl border mb-3 transition-all relative overflow-hidden",
            question.status === QuestionStatus.PENDING ? "bg-white border-amber-200 shadow-sm" :
                question.status === QuestionStatus.REPLYING ? "bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-400" :
                    question.status === QuestionStatus.PINNED ? "bg-indigo-50 border-indigo-200 shadow-sm" :
                        question.status === QuestionStatus.RESOLVED ? "bg-slate-50 border-slate-200 opacity-70" :
                            "bg-white border-slate-200 shadow-sm"
        )}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                        {displayAvatar ? (
                            <Avatar>
                                <DefaultAvatar user={displayAvatar} />
                            </Avatar>
                        ) : (
                            <User className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className='flex gap-2'>
                            <span className="text-sm font-bold text-slate-800">{displayName}</span>
                            <span className="text-sm text-slate-800 bg-slate-100 px-1 rounded">#{question.id}</span>
                        </div>

                        <div className="flex items-center text-[11px] text-slate-500 gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: vi })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <QuestionStatusBadge status={question.status} />

                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                        {question.upvoteCount || 0}
                    </div>
                </div>
            </div>

            <p className="text-slate-800 text-sm md:text-base mb-4 whitespace-pre-wrap leading-relaxed">
                {question.content}
            </p>

            {/* action buttons */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                {question.status === QuestionStatus.PENDING && (
                    <>
                        <Button
                            variant="outline" size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleAction(QuestionStatus.REJECTED)} disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1.5" />} Từ chối
                        </Button>
                        <Button
                            size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleAction(QuestionStatus.APPROVED)} disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />} Duyệt câu hỏi
                        </Button>
                    </>
                )}

                {/* APPROVED: can pin question or start replying */}
                {question.status === QuestionStatus.APPROVED && (
                    <>
                        <Button
                            size="sm" variant="outline" className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => handleAction(QuestionStatus.PINNED)} disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pin className="w-4 h-4 mr-1.5" />}Ghim
                        </Button>
                        <Button
                            size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => handleAction(QuestionStatus.REPLYING)} disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4 mr-1.5" />} Trả lời
                        </Button>
                    </>
                )}

                {/* PINNED */}
                {question.status === QuestionStatus.PINNED && (
                    <>
                        <Button
                            size="sm" variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => handleAction(QuestionStatus.PINNED)} disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PinOff className="w-4 h-4 mr-1.5" />} Bỏ ghim
                        </Button>
                        <Button
                            size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={() => handleAction(QuestionStatus.REPLYING)} disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4 mr-1.5" />} Bắt đầu trả lời
                        </Button>
                    </>
                )}

                {question.status === QuestionStatus.REPLYING && (
                    <>
                        <Button
                            size="sm" variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => handleAction(QuestionStatus.REPLYING)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MicOff className="w-4 h-4 mr-1.5" />} Dừng trả lời
                        </Button>
                        <Button
                            size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            onClick={() => handleAction(QuestionStatus.RESOLVED)} disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />} Hoàn tất
                        </Button>
                    </>
                )}

            </div>
        </div>
    );
};

export default OrganizerQuestionItem;