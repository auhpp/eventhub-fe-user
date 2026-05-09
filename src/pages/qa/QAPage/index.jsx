import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QuestionInput from './QuestionInput';
import QuestionItem from './QuestionItem';
import { Loader2, MessageSquareOff } from 'lucide-react';
import { toast } from 'sonner';
import { AuthContext } from '@/context/AuthContex';
import { filterQuestions } from '@/services/questionService';
import { useQAAttendeeSubscription } from '@/hooks/useQAAttendeeSubscription';
import { useQAOwnerSubscription } from '@/hooks/useQAOwnerSubscription';
import { QuestionStatus } from '@/utils/constant';

const QAPage = () => {
    const { eventSessionId } = useParams();
    const { user: currentUser } = useContext(AuthContext);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'public';

    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observerTarget = useRef(null);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    // 1. Reset state when change tab
    useEffect(() => {
        setQuestions([]);
        setPage(1);
        setHasMore(true);
        setIsLoading(true);
        setIsFetchingMore(false);
    }, [activeTab]);

    // 2. Fetch API 
    useEffect(() => {
        let isCancelled = false;

        const fetchQuestions = async () => {
            if (!eventSessionId || !currentUser) {
                if (!isCancelled) setIsLoading(false);
                return;
            }

            if (page > 1 && !hasMore) return;

            if (page === 1) {
                setIsLoading(true);
            } else {
                setIsFetchingMore(true);
            }

            try {
                let targetStatuses = [];
                if (activeTab === 'public') {
                    targetStatuses = [QuestionStatus.APPROVED,
                    QuestionStatus.PINNED, QuestionStatus.REPLYING];
                } else if (activeTab === 'resolved') {
                    targetStatuses = [QuestionStatus.RESOLVED];
                } else if (activeTab === 'my_questions') {
                    targetStatuses = [QuestionStatus.APPROVED,
                    QuestionStatus.PINNED,
                    QuestionStatus.REPLYING,
                    QuestionStatus.PENDING, QuestionStatus.REJECTED,
                    QuestionStatus.RESOLVED];
                }

                const res = await filterQuestions({
                    data: {
                        eventSessionId: Number(eventSessionId),
                        statuses: targetStatuses
                    },
                    page: page,
                    size: 10
                });

                if (isCancelled) return;

                let fetchedQuestions = res.result?.data || [];
                const totalPages = res.result?.totalPage || 1;

                if (activeTab === 'my_questions') {
                    fetchedQuestions = fetchedQuestions.filter(q => q.appUser?.id === currentUser?.id);
                }

                setQuestions(prev => {
                    if (page === 1) return fetchedQuestions;

                    const existingIds = new Set(prev.map(q => q.id));
                    const newQuestions = fetchedQuestions.filter(q => !existingIds.has(q.id));

                    return [...prev, ...newQuestions];
                });

                setHasMore(page < totalPages);
            } catch (error) {
                console.error(error);
                if (!isCancelled) toast.error("Không thể tải danh sách câu hỏi.");
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                    setIsFetchingMore(false);
                }
            }
        };

        fetchQuestions();

        // Cleanup function 
        return () => {
            isCancelled = true;
        };
    }, [eventSessionId, currentUser, activeTab, page]);

    // 3. Observer scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore &&
                    !isLoading && !isFetchingMore) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isLoading, isFetchingMore]);

    const handleQuestionSent = useCallback((newQuestion) => {
        setQuestions(prev => {
            if (prev.some(q => q.id === newQuestion.id)) return prev;
            return [newQuestion, ...prev];
        });

        if (newQuestion.status === QuestionStatus.PENDING) {
            toast.success("Đã gửi câu hỏi. Vui lòng chờ Ban tổ chức duyệt!");
            handleTabChange('my_questions');
        } else {
            toast.success("Câu hỏi của bạn đã được gửi!");
        }
    }, []);

    useQAAttendeeSubscription(eventSessionId, useCallback((incomingData) => {
        setQuestions(prev => {
            const exists = prev.find(q => q.id === incomingData.id);
            if (exists) {
                return prev.map(q => q.id === incomingData.id ? incomingData : q);
            }
            return [incomingData, ...prev];
        });
    }, []));

    useQAOwnerSubscription(useCallback((incomingData) => {
        setQuestions(prev => {
            const exists = prev.find(q => q.id === incomingData.id);
            if (exists) {
                if (exists.status === 'PENDING' && incomingData.status === 'APPROVED') {
                    toast.success("Câu hỏi của bạn đã được phê duyệt và công khai!");
                } else if (exists.status === 'PENDING' && incomingData.status === 'REJECTED') {
                    toast.error("Một câu hỏi của bạn đã bị từ chối hiển thị.");
                }
                return prev.map(q => q.id === incomingData.id ? incomingData : q);
            }
            return [incomingData, ...prev];
        });
    }, []));

    const handleOptimisticUpvote = useCallback((questionId, newCount, isUpVoted) => {
        setQuestions(prev => prev.map(q =>
            q.id === questionId
                ? { ...q, upvoteCount: newCount, upVoted: isUpVoted }
                : q
        ));
    }, []);

    const handleDeleteSuccess = useCallback((deletedQuestionId) => {
        setQuestions(prev => prev.filter(q => q.id !== deletedQuestionId));
    }, []);

    const displayedQuestions = questions.filter(q => {
        if (activeTab === 'public') {
            return [QuestionStatus.APPROVED, QuestionStatus.PINNED, QuestionStatus.REPLYING].includes(q.status);
        } else if (activeTab === 'resolved') {
            return q.status === QuestionStatus.RESOLVED;
        } else {
            return q.appUser?.id === currentUser?.id;
        }
    });

    // 4. Logic sort questions:
    const sortedQuestions = [...displayedQuestions].sort((a, b) => {
        if (activeTab === 'my_questions') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }

        if (a.status === QuestionStatus.REPLYING && b.status !== QuestionStatus.REPLYING) return -1;
        if (a.status !== QuestionStatus.REPLYING && b.status === QuestionStatus.REPLYING) return 1;

        if (a.status === QuestionStatus.PINNED && b.status !== QuestionStatus.PINNED) return -1;
        if (a.status !== QuestionStatus.PINNED && b.status === QuestionStatus.PINNED) return 1;

        const voteA = a.upvoteCount || 0;
        const voteB = b.upvoteCount || 0;
        if (voteB !== voteA) {
            return voteB - voteA;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-4 py-3">
                    <div className="container max-w-4xl mx-auto flex items-center justify-between">
                        <h1 className="text-lg font-bold text-slate-800">Hỏi & Đáp (Q&A)</h1>
                        <div className="text-sm text-slate-500 font-medium">
                            {displayedQuestions.length} Câu hỏi
                        </div>
                    </div>
                </div>

                <div className="px-4 border-t border-slate-100">
                    <div className="container max-w-4xl mx-auto flex gap-6">
                        <button
                            onClick={() => handleTabChange('public')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${activeTab === 'public'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Công khai
                        </button>
                        <button
                            onClick={() => handleTabChange('resolved')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${activeTab === 'resolved'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Đã trả lời
                        </button>
                        <button
                            onClick={() => handleTabChange('my_questions')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${activeTab === 'my_questions'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            Của tôi
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-28">
                <div className="container max-w-4xl mx-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : sortedQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquareOff className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-600">
                                {activeTab === 'public' ? "Chưa có câu hỏi nào" :
                                    activeTab === 'resolved' ? "Chưa có câu hỏi nào được trả lời xong" :
                                        "Bạn chưa đặt câu hỏi nào"}
                            </p>
                            <p className="text-sm mt-1">
                                {activeTab === 'public' ? "Hãy là người đầu tiên đặt câu hỏi cho diễn giả!" :
                                    activeTab === 'resolved' ? "Các câu hỏi đã giải quyết sẽ được lưu trữ tại đây." :
                                        "Các câu hỏi của bạn sẽ hiển thị tại đây."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {sortedQuestions.map(q => (
                                <QuestionItem
                                    key={q.id}
                                    question={q}
                                    currentUserId={currentUser?.id}
                                    onOptimisticUpvote={handleOptimisticUpvote}
                                    onDeleteSuccess={handleDeleteSuccess}
                                />
                            ))}

                            <div ref={observerTarget} className="h-4 w-full" />

                            {isFetchingMore && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <QuestionInput eventSessionId={eventSessionId} onQuestionSent={handleQuestionSent} />
        </div>
    );
};

export default QAPage;