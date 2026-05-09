import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { createQuestion } from '@/services/questionService';

const QuestionInput = ({ eventSessionId, onQuestionSent }) => {
    const [content, setContent] = useState('');
    const [hasAnonymous, setHasAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedContent = content.trim();
        if (!trimmedContent) {
            toast.warning("Vui lòng nhập nội dung câu hỏi!");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                content: trimmedContent,
                hasAnonymous: hasAnonymous,
                eventSessionId: Number(eventSessionId)
            };

            const newQuestion = await createQuestion(payload);

            // take question to parent component to add to list
            onQuestionSent(newQuestion.result);

            // Clear form after successful submission
            setContent('');
            setHasAnonymous(false);

        } catch (error) {
            console.error(error);
            if (error.response?.status === 429 || error.response?.data?.code === 'RATE_LIMIT_EXCEEDED') {
                toast.error("Bạn thao tác quá nhanh, vui lòng thử lại sau.");
            } else {
                toast.error("Không thể gửi câu hỏi lúc này. Vui lòng thử lại!");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sticky bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="container max-w-4xl mx-auto flex flex-col gap-3">
                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn cho sự kiện..."
                            className="w-full bg-transparent p-3 outline-none resize-none h-12 max-h-32 text-sm"
                            rows={1}
                            disabled={isSubmitting}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>

                <div className="flex items-center space-x-2 px-1">
                    <Checkbox
                        id="anonymous"
                        checked={hasAnonymous}
                        onCheckedChange={setHasAnonymous}
                        disabled={isSubmitting}
                    />
                    <label
                        htmlFor="anonymous"
                        className="text-sm font-medium leading-none text-slate-600 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Hỏi ẩn danh
                    </label>
                </div>
            </div>
        </div>
    );
};

export default QuestionInput;