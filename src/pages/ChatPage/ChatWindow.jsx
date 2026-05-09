import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { createMessage, getMessages, markMessageSeen, seenByConversation } from '@/services/messageService';
import { disableConversation } from '@/services/conversationService';
import { MessageStatus } from '@/utils/constant';
import { AuthContext } from '@/context/AuthContex';

const ChatWindow = ({
    conversation,
    refreshConversations,
    realtimeMessage,
    realtimeStatus,
    userStatusUpdate,
    onDisabled
}) => {
    const { user: currentUser } = useContext(AuthContext);
    const processedRealtimeMsgs = useRef(new Set());
    const [messages, setMessages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const currentMember = conversation?.conversationMembers?.find((m) => m.appUser?.id === currentUser?.id);
    const otherMemberObj = conversation?.conversationMembers?.find((m) => m.appUser?.id !== currentUser?.id);
    const otherUser = otherMemberObj?.appUser;

    const isBlockedByMe = currentMember?.status === 'INACTIVE';
    const isBlockedByThem = otherMemberObj?.status === 'INACTIVE';
    const [onlineStatus, setOnlineStatus] = useState({
        isOnline: otherUser?.isOnline,
        lastSeen: otherUser?.lastSeen
    });

    useEffect(() => {
        setOnlineStatus({
            isOnline: otherUser?.isOnline,
            lastSeen: otherUser?.lastSeen
        });
    }, [otherUser?.id]);
    useEffect(() => {
        if (userStatusUpdate && otherUser && userStatusUpdate.id === otherUser.id) {
            setOnlineStatus({
                isOnline: userStatusUpdate.isOnline,
                lastSeen: userStatusUpdate.lastSeen
            });
        }
    }, [userStatusUpdate, otherUser?.id]);
    const currentOtherUser = otherUser ? {
        ...otherUser,
        isOnline: onlineStatus.isOnline,
        lastSeen: onlineStatus.lastSeen
    } : null;

    useEffect(() => {
        setMessages([]);
        setCurrentPage(1);
        setHasMore(true);
    }, [conversation.id]);

    const fetchMessages = useCallback(async (pageToLoad = 1, isLoadMore = false) => {
        if (!conversation?.id || conversation.isVirtual) return;
        if (isLoadMore) setIsLoadingMore(true);
        try {
            const res = await getMessages({ conversationId: conversation.id, page: pageToLoad, size: 10 });
            const fetchedMessages = res.result.data?.reverse() || [];
            setHasMore(pageToLoad < res.result.totalPage);
            setMessages(prev => {
                if (isLoadMore) return [...fetchedMessages, ...prev];
                return fetchedMessages;
            });
            if (!isLoadMore) {
                const hasUnread = fetchedMessages.some(
                    (msg) => msg.sender?.id !== currentUser?.id && msg.status !== MessageStatus.SEEN
                );
                if (hasUnread) await seenByConversation({ conversationId: conversation.id });
            }
        } catch (error) {
            console.error("Lỗi khi tải tin nhắn:", error);
        } finally {
            if (isLoadMore) setIsLoadingMore(false);
        }
    }, [conversation.id, currentUser?.id]);

    useEffect(() => {
        if (currentPage === 1) fetchMessages(1, false);
    }, [conversation.id, currentPage, fetchMessages]);

    const handleLoadMore = () => {
        if (hasMore && !isLoadingMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchMessages(nextPage, true);
        }
    };

    // --- ENABLE CONVERSATION ---
    const handleUnblock = async () => {
        if (!currentMember) return;
        try {
            await disableConversation({ memberId: currentMember.id });
            refreshConversations(); 
        } catch (error) {
            console.error("Lỗi khi bỏ chặn cuộc trò chuyện:", error);
        }
    };

    useEffect(() => {
        if (!realtimeMessage || realtimeMessage.conversationId !== conversation.id) return;
        setMessages((prev) => {
            const isExist = prev.some(msg =>
                (msg.id !== null && msg.id === realtimeMessage.id) ||
                (msg.tempId !== null && msg.tempId === realtimeMessage.tempId)
            );
            if (isExist) {
                return prev.map(msg => {
                    if ((msg.id !== null && msg.id === realtimeMessage.id) ||
                        (msg.tempId !== null && msg.tempId === realtimeMessage.tempId)) {
                        return realtimeMessage;
                    }
                    return msg;
                });
            }
            return [...prev, realtimeMessage];
        });

        if (realtimeMessage.sender?.id !== currentUser?.id) {
            if (!processedRealtimeMsgs.current.has(realtimeMessage.id)) {
                processedRealtimeMsgs.current.add(realtimeMessage.id); 

                markMessageSeen(realtimeMessage.id).then(() => {
                    refreshConversations();
                }).catch(console.error);
            }
        }
    }, [realtimeMessage, conversation.id, currentUser?.id, refreshConversations]);

    useEffect(() => {
        if (realtimeStatus) {
            let isRefresh = false;
            setMessages((prev) => prev.map((msg) => {
                const isSender = msg.sender?.id === currentUser?.id;
                const isMatch = msg.id === realtimeStatus.id;
                if (realtimeStatus.status === MessageStatus.RECEIVED && isMatch && isSender && msg.status === MessageStatus.SENT) {
                    return { ...msg, status: MessageStatus.RECEIVED, id: msg.id };
                }
                if (realtimeStatus.status === MessageStatus.SEEN && isMatch && isSender && msg.status !== MessageStatus.SEEN) {
                    isRefresh = true;
                    return { ...msg, status: MessageStatus.SEEN };
                }
                if (realtimeStatus.bulk && realtimeStatus.conversationId === conversation.id) {
                    if (isSender && msg.status !== MessageStatus.SEEN) {
                        isRefresh = true;
                        return { ...msg, status: MessageStatus.SEEN };
                    }
                }
                return msg;
            }));
            if (isRefresh) refreshConversations();
        }
    }, [conversation.id, currentUser?.id, realtimeStatus, refreshConversations]);

    const handleSendMessage = async (formData) => {
        const tempId = formData.get('tempId');
        try {
            if (otherUser?.id) formData.append('recipientId', otherUser.id);
            const res = await createMessage(formData);
            setMessages((prev) => [...prev, res.result]);
            refreshConversations();
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            setMessages((prev) => prev.map(msg =>
                msg.tempId === tempId ? { ...msg, status: MessageStatus.FAILED } : msg
            ));
        }
    };

    return (
        <div className="flex flex-col h-full w-full rounded-lg border overflow-hidden">
            <ChatHeader
                otherUser={currentOtherUser}
                conversation={conversation}
                refreshConversations={refreshConversations}
                onDisabled={onDisabled}
                currentUser={currentUser}
                isBlockedByMe={isBlockedByMe} 
                onUnblock={handleUnblock} 
            />

            <div className="flex-1 overflow-hidden relative">
                <MessageList
                    messages={messages}
                    currentUser={currentUser}
                    otherUser={currentOtherUser}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                />
            </div>

            {/* CONDITIONAL RENDER*/}
            {isBlockedByMe ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500 border-t flex items-center justify-center gap-1">
                    Bạn đã chặn cuộc trò chuyện này.
                    <button onClick={handleUnblock} className="font-semibold text-brand hover:underline">
                        Bỏ chặn
                    </button>
                    để tiếp tục.
                </div>
            ) : isBlockedByThem ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500 border-t">
                    Bạn không thể gửi tin nhắn vào lúc này.
                </div>
            ) : (
                <ChatInput onSendMessage={handleSendMessage} conversationId={conversation.id} />
            )}
        </div>
    );
};

export default ChatWindow;