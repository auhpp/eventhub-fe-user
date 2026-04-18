import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EventContext } from '@/context/EventContext';
import { AuthContext } from '@/context/AuthContex';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganizerQuestionItem from './OrganizerQuestionItem';
import { Loader2, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { filterQuestions, updateQuestion } from '@/services/questionService';
import { useQAOrganizerSubscription } from '@/hooks/useQAOrganizerSubscription';
import { useQAAttendeeSubscription } from '@/hooks/useQAAttendeeSubscription';
import SessionSelector from '@/components/SessionSelector';
import { QuestionStatus } from '@/utils/constant';

const QAOrganizerPage = () => {
    const { event } = useContext(EventContext);
    const { user: currentUser } = useContext(AuthContext);

    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'pending';

    const sessions = event?.eventSessions || [];

    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observerTarget = useRef(null);

    useEffect(() => {
        if (sessions.length > 0 && !selectedSessionId) {
            setSelectedSessionId(sessions[0].id);
        }
    }, [sessions, selectedSessionId]);

    // 1. Reset state when changing tab or session
    useEffect(() => {
        setQuestions([]);
        setPage(1);
        setHasMore(true);
        setIsLoading(true);
        setIsFetchingMore(false);

        // scroll to top when changing tab or session
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab, selectedSessionId]);

    //  2. Fetch questions
    useEffect(() => {
        let isCancelled = false;

        const fetchQuestions = async () => {
            if (!selectedSessionId) {
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
                if (activeTab === 'pending') {
                    targetStatuses = [QuestionStatus.PENDING];
                } else if (activeTab === 'live') {
                    targetStatuses = [QuestionStatus.APPROVED, QuestionStatus.PINNED, QuestionStatus.REPLYING];
                } else if (activeTab === 'resolved') {
                    targetStatuses = [QuestionStatus.RESOLVED];
                } else if (activeTab === 'rejected') {
                    targetStatuses = [QuestionStatus.REJECTED];
                }

                const res = await filterQuestions({
                    data: {
                        eventSessionId: Number(selectedSessionId),
                        statuses: targetStatuses
                    },
                    page: page,
                    size: 10
                });

                if (isCancelled) return;

                let fetchedQuestions = res.result?.data || [];
                const totalPages = res.result?.totalPage || 1;

                setQuestions(prev => {
                    if (page === 1) return fetchedQuestions;

                    // filter out questions that already exist in state to avoid duplicates when paginating
                    const existingIds = new Set(prev.map(q => q.id));
                    const newQuestions = fetchedQuestions.filter(q => !existingIds.has(q.id));

                    return [...prev, ...newQuestions];
                });

                setHasMore(page < totalPages);
            } catch (error) {
                console.error(error);
                if (!isCancelled) toast.error("Không tải được dữ liệu Q&A");
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                    setIsFetchingMore(false);
                }
            }
        };

        fetchQuestions();

        return () => {
            isCancelled = true;
        };
    }, [selectedSessionId, activeTab, page]);

    // 3. Observer scroll to load more
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
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

    const handleUpdateStatus = async (question, newStatus) => {
        try {
            const res = await updateQuestion({
                id: question.id,
                data: {
                    status: newStatus,
                    hasAnonymous: question.hasAnonymous,
                    content: question.content
                }
            });

            setQuestions(prev => {
                return prev.map(q => q.id === question.id ? { ...q, status: res.result.status } : q);
            });

            if (newStatus === QuestionStatus.REJECTED) toast.success("Đã từ chối câu hỏi");
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    useQAOrganizerSubscription(currentUser?.id, useCallback((incomingQuestion) => {
        if (incomingQuestion.eventSessionId !== selectedSessionId) return;
        if (activeTab === 'pending') {
            if (incomingQuestion.status === QuestionStatus.PENDING) {
                setQuestions(prev => {
                    if (prev.some(q => q.id === incomingQuestion.id)) return prev;
                    return [incomingQuestion, ...prev];
                });
            }
            else if (incomingQuestion.status === null) {
                setQuestions(prev => {
                    return prev.filter(q => q.id !== incomingQuestion.id);
                });
            }
        }
    }, [selectedSessionId, activeTab]));

    useQAAttendeeSubscription(selectedSessionId, useCallback((incomingQuestion) => {
        setQuestions(prev => {
            const exists = prev.find(q => q.id === incomingQuestion.id);
            if (exists) {
                return prev.map(q => q.id === incomingQuestion.id ? incomingQuestion : q);
            }

            const isLiveStatus = [QuestionStatus.APPROVED, QuestionStatus.PINNED, QuestionStatus.REPLYING].includes(incomingQuestion.status);
            if (
                (activeTab === 'live' && isLiveStatus) ||
                (activeTab === 'resolved' && incomingQuestion.status === QuestionStatus.RESOLVED) ||
                (activeTab === 'rejected' && incomingQuestion.status === QuestionStatus.REJECTED)
            ) {
                return [incomingQuestion, ...prev];
            }
            return prev;
        });
    }, [selectedSessionId, activeTab]));

    // Logic Sort local 
    let displayedQuestions = [...questions];
    if (activeTab === 'pending') {
        displayedQuestions = displayedQuestions
            .filter(q => q.status === QuestionStatus.PENDING)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === 'live') {
        displayedQuestions = displayedQuestions
            .filter(q => [QuestionStatus.APPROVED, QuestionStatus.PINNED, QuestionStatus.REPLYING].includes(q.status))
            .sort((a, b) => {
                if (a.status === QuestionStatus.REPLYING && b.status !== QuestionStatus.REPLYING) return -1;
                if (a.status !== QuestionStatus.REPLYING && b.status === QuestionStatus.REPLYING) return 1;

                if (a.status === QuestionStatus.PINNED && b.status !== QuestionStatus.PINNED) return -1;
                if (a.status !== QuestionStatus.PINNED && b.status === QuestionStatus.PINNED) return 1;

                return (b.upvoteCount || 0) - (a.upvoteCount || 0);
            });
    } else if (activeTab === 'resolved') {
        displayedQuestions = displayedQuestions
            .filter(q => q.status === QuestionStatus.RESOLVED)
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    } else if (activeTab === 'rejected') {
        displayedQuestions = displayedQuestions
            .filter(q => q.status === QuestionStatus.REJECTED)
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }

    const EmptyState = ({ text }) => (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
            <Inbox className="w-10 h-10 mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">{text}</p>
        </div>
    );

    const handleTabChange = (value) => {
        setSearchParams({ tab: value });
    };

    return (
        <div className="container mx-auto pb-20 ">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Quản trị Hỏi & Đáp (Q&A)</h1>
                <p className="text-slate-500 mt-1">Lọc, phê duyệt và điều phối trả lời các câu hỏi nổi bật.</p>
            </div>

            <SessionSelector
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onSelect={setSelectedSessionId}
            />

            <Tabs value={activeTab} onValueChange={handleTabChange} className="">
                <TabsList className="mb-6 bg-slate-100 p-1 rounded-lg h-9">
                    <TabsTrigger value="pending"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        Chờ duyệt
                    </TabsTrigger>
                    <TabsTrigger value="live"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        Trực tiếp (Live)
                    </TabsTrigger>
                    <TabsTrigger value="resolved"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        Đã xong
                    </TabsTrigger>
                    <TabsTrigger value="rejected"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        Đã từ chối
                    </TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : displayedQuestions.length === 0 ? (
                        <EmptyState
                            text={
                                activeTab === 'pending' ? "Chưa có câu hỏi nào đang chờ duyệt" :
                                    activeTab === 'live' ? "Chưa có câu hỏi nào đang hiển thị" :
                                        activeTab === 'resolved' ? "Chưa có câu hỏi nào hoàn tất" :
                                            "Không có câu hỏi nào bị từ chối"
                            }
                        />
                    ) : (
                        <>
                            {displayedQuestions.map(q => (
                                <OrganizerQuestionItem key={q.id} question={q} onUpdateStatus={handleUpdateStatus} />
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
            </Tabs>
        </div>
    );
};

export default QAOrganizerPage;