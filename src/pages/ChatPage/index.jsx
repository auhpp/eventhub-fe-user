import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContex';
import { getConversations } from '@/services/conversationService';
import ChatWindow from './ChatWindow';
import ChatSidebar from './ChatSidebar';
import { MessageStatus } from '@/utils/constant';
import { useChat } from '@/context/ChatContext';

const ChatPage = () => {
    const { user: currentUser } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const activeIdFromUrl = searchParams.get('id');

    const { realtimeMessage, realtimeStatus, userStatusUpdate } = useChat();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Reset list chat to 1 when searchName or filterType change
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setConversations([]);
    }, [searchName, filterType]);

    const fetchConversations = useCallback(async (pageToFetch = 1) => {
        try {
            if (pageToFetch === 1) setIsLoading(true);
            else setIsFetchingMore(true);

            let statusParam = null;
            let hasPinParam = null;
            if (filterType === 'UNREAD') {
                statusParam = MessageStatus.RECEIVED;
            } else if (filterType === 'PINNED') {
                hasPinParam = true;
            }
            const res = await getConversations({
                page: pageToFetch,
                size: 15,
                nameMember: searchName.trim() || null,
                status: statusParam,
                hasPin: hasPinParam
            });

            let data = res.result.data || [];

            const totalPages = res.result?.totalPage || 1;

            setConversations(prev => {
                if (pageToFetch === 1) return data;

                // filter existing conversations to avoid duplicates when load more
                const existingIds = new Set(prev.map(c => c.id));
                const newConvs = data.filter(c => !existingIds.has(c.id));
                return [...prev, ...newConvs];
            });

            setHasMore(pageToFetch < totalPages);
        } catch (error) {
            console.error("Lỗi khi tải danh sách chat:", error);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [searchName, filterType]);

    useEffect(() => {
        if (!currentUser) return;

        const timer = setTimeout(() => {
            fetchConversations(page);
        }, 300);

        return () => clearTimeout(timer);
    }, [currentUser, searchName, filterType, page, fetchConversations]);

    // call load more when scroll to end of sidebar list
    const handleLoadMore = useCallback(() => {
        if (!isLoading && !isFetchingMore && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [isLoading, isFetchingMore, hasMore]);

    // auto set active conversation when conversations loaded or url param change
    useEffect(() => {
        if (conversations.length > 0 && activeIdFromUrl) {
            const foundConv = conversations.find(c => String(c.id) === String(activeIdFromUrl));
            if (foundConv && (!activeConversation || activeConversation.id !== foundConv.id)) {
                setActiveConversation(foundConv);
            }
        }
    }, [conversations, activeIdFromUrl]);

    // Handle LOGIC: Auto open chat when from EventOrganizer
    useEffect(() => {
        if (!isLoading && location.state?.targetUser && currentUser) {
            const targetUser = location.state.targetUser;

            const existingConv = conversations.find(conv =>
                conv.conversationMembers?.some(m => m.appUser?.id === targetUser.id)
            );

            if (existingConv) {
                handleSelectConversation(existingConv);
            } else {
                const virtualConvId = `temp_${targetUser.id}`;
                const virtualConv = {
                    id: virtualConvId,
                    isVirtual: true,
                    conversationMembers: [
                        { appUser: currentUser },
                        { appUser: targetUser }
                    ],
                    latestMessage: null
                };

                setConversations(prev => {
                    const exists = prev.find(c => c.id === virtualConvId);
                    if (!exists) return [virtualConv, ...prev];
                    return prev;
                });

                handleSelectConversation(virtualConv);
            }

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [isLoading, location.state, currentUser, conversations, navigate, location.pathname]);

    useEffect(() => {
        if (realtimeMessage) {
            // when receive new message, refresh conversation list to update latest message and order
            setPage(1);
            fetchConversations(1);
        }
    }, [realtimeMessage]);

    // choose conversation from sidebar
    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setSearchParams({ id: conv.id });
    };

    // Handle conversation deletion
    const handleConversationDeleted = () => {
        setActiveConversation(null);
        searchParams.delete('id');
        setSearchParams(searchParams);
        setPage(1);
        fetchConversations(1);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-white dark:bg-gray-900 border-t mx-auto
         max-w-7xl overflow-hidden">
            <div className="w-full md:w-80 lg:w-[400px] border-r flex-shrink-0 flex flex-col">
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConversation?.id}
                    onSelectConversation={handleSelectConversation}
                    currentUser={currentUser}
                    isLoading={isLoading}
                    userStatusUpdate={userStatusUpdate}
                    searchName={searchName}
                    setSearchName={setSearchName}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    hasMore={hasMore}
                    loadMore={handleLoadMore}
                    isFetchingMore={isFetchingMore}
                />
            </div>

            <div className={` flex-1 flex-col p-2 bg-gray-50/50 ${activeConversation ?
                'flex' : 'hidden md:flex'}`}>
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        currentUser={currentUser}
                        refreshConversations={() => fetchConversations(1)}
                        realtimeMessage={realtimeMessage}
                        realtimeStatus={realtimeStatus}
                        userStatusUpdate={userStatusUpdate}
                        onDeleted={handleConversationDeleted}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex
                         items-center justify-center mb-4">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </div>
                        <p className="text-lg font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;