import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { createMessage, getMessages, markMessageSeen, seenByConversation } from '@/services/messageService';
import { MessageStatus } from '@/utils/constant';

const ChatWindow = ({ conversation, currentUser, refreshConversations, realtimeMessage,
     realtimeStatus, userStatusUpdate,
    onDeleted
}) => {
    const [messages, setMessages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const otherUser = conversation?.conversationMembers?.find(
        (m) => m.appUser?.id !== currentUser?.id
    )?.appUser;
    const [currentOtherUser, setCurrentOtherUser] = useState(otherUser);

    useEffect(() => {
        setCurrentOtherUser(otherUser);
    }, [conversation.id]);

    useEffect(() => {
        if (userStatusUpdate && currentOtherUser && userStatusUpdate.id === currentOtherUser.id) {
            console.log("chat window", userStatusUpdate)
            setCurrentOtherUser(prev => ({
                ...prev,
                isOnline: userStatusUpdate.isOnline,
                lastSeen: userStatusUpdate.lastSeen
            }));
        }
    }, [userStatusUpdate]);
    // Reset state when change to other conversation
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
                if (isLoadMore) {
                    return [...fetchedMessages, ...prev];
                }
                return fetchedMessages;
            });

            if (!isLoadMore) {
                const hasUnread = fetchedMessages.some(
                    (msg) => msg.sender?.id !== currentUser?.id && msg.status !== MessageStatus.SEEN
                );
                if (hasUnread) {
                    await seenByConversation({ conversationId: conversation.id });
                }
            }

        } catch (error) {
            console.error("Lỗi khi tải tin nhắn:", error);
        } finally {
            if (isLoadMore) setIsLoadingMore(false);
        }
    }, [conversation.id, currentUser?.id]);

    useEffect(() => {
        if (currentPage === 1) {
            fetchMessages(1, false);
        }
    }, [conversation.id, currentPage]);

    const handleLoadMore = () => {
        if (hasMore && !isLoadingMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchMessages(nextPage, true);
        }
    };

    // --- listen new message from WEBSOCKET ---
    useEffect(() => {
        if (!realtimeMessage || realtimeMessage.conversationId !== conversation.id) return;

        setMessages((prev) => {
            const isExist = prev.some(msg =>
                (msg.id !== null && msg.id === realtimeMessage.id) ||
                (msg.tempId !== null && msg.tempId === realtimeMessage.tempId)
            );

            if (isExist) {
                return prev.map(msg => {
                    const matchById = msg.id !== null && msg.id === realtimeMessage.id;
                    const matchByTempId = msg.tempId !== null && msg.tempId === realtimeMessage.tempId;

                    if (matchById || matchByTempId) {
                        return realtimeMessage; 
                    }
                    return msg;
                });
            }

            return [...prev, realtimeMessage];
        });

        if (realtimeMessage.sender?.id !== currentUser?.id) {
            markMessageSeen(realtimeMessage.id).then(() => {
                refreshConversations();
            }).catch(console.error);
        }

    }, [realtimeMessage, conversation.id, currentUser?.id, refreshConversations]);

    // --- listen status (SEEN/RECEIVED) from WEBSOCKET ---
    useEffect(() => {
        if (realtimeStatus) {
            let isRefresh = false; 

            console.log(realtimeStatus)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMessages((prev) => prev.map((msg) => {
                const isSender = msg.sender?.id === currentUser?.id;

                const isMatch = msg.id === realtimeStatus.id;
                if (realtimeStatus.status === MessageStatus.RECEIVED && isMatch && isSender && msg.status === MessageStatus.SENT) {
                    console.log(MessageStatus.RECEIVED)

                    return { ...msg, status: MessageStatus.RECEIVED, id: msg.id };
                }

                if (realtimeStatus.status === MessageStatus.SEEN && isMatch && isSender 
                    && msg.status !== MessageStatus.SEEN) {
                    isRefresh = true;
                    console.log(MessageStatus.SEEN)

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

            if (isRefresh) {
                refreshConversations();
            }
        }
    }, [conversation.id, currentUser?.id, realtimeStatus, refreshConversations]);


    // --- handle send message
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
        <div className="flex flex-col h-full w-full rounded-lg border overflow-hidden ">
            <ChatHeader
                otherUser={currentOtherUser}
                conversation={conversation}
                refreshConversations={refreshConversations}
                onDeleted={onDeleted}
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
            <ChatInput onSendMessage={handleSendMessage} conversationId={conversation.id} />
        </div>
    );
};

export default ChatWindow;