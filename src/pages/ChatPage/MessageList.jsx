import React, { useRef, useLayoutEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MessageBubble from './MessageBubble';

// --- HELPER FUNCTIONS handle date ---
const isSameDay = (dateString1, dateString2) => {
    if (!dateString1 || !dateString2) return false;
    const d1 = new Date(dateString1);
    const d2 = new Date(dateString2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

const formatDateLabel = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
        return "Hôm nay"; 
    } else if (isSameDay(date, yesterday)) {
        return "Hôm qua";
    } else {
        // ex: "Th 5, 24/03/2026"
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};

const MessageList = ({ messages, currentUser, otherUser, onLoadMore, hasMore, isLoadingMore }) => {
    const listRef = useRef(null);
    const bottomRef = useRef(null);

    const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);

    const prevScrollHeight = useRef(0);
    const prevMessagesLength = useRef(0);

    useLayoutEffect(() => {
        if (!listRef.current) return;

        const currentScrollHeight = listRef.current.scrollHeight;
        const currentScrollTop = listRef.current.scrollTop;
        const clientHeight = listRef.current.clientHeight;

        if (prevMessagesLength.current === 0 && messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        }
        else if (messages.length > prevMessagesLength.current) {
            if (currentScrollTop < 10) {
                const heightDifference = currentScrollHeight - prevScrollHeight.current;
                listRef.current.scrollTop = currentScrollTop + heightDifference;
            }
            else {
                const latestMessage = messages[messages.length - 1];
                const isMyMessage = latestMessage?.sender?.id === currentUser?.id;
                const isAtBottom = currentScrollHeight - currentScrollTop - clientHeight < 150;

                if (isAtBottom || isMyMessage) {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setShowNewMessageAlert(false);
                }
                else {
                    setShowNewMessageAlert(true);
                }
            }
        }

        prevScrollHeight.current = currentScrollHeight;
        prevMessagesLength.current = messages.length;

    }, [messages, currentUser?.id]);

    const handleScroll = () => {
        if (!listRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;

        if (scrollTop === 0 && hasMore && !isLoadingMore) {
            onLoadMore();
        }

        if (scrollHeight - scrollTop - clientHeight < 50 && showNewMessageAlert) {
            setShowNewMessageAlert(false);
        }
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowNewMessageAlert(false);
    };

    // find index of last message sent by ME, to decide when show status (SEEN/RECEIVED)
    let lastMyMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].sender?.id === currentUser?.id) {
            lastMyMessageIndex = i;
            break;
        }
    }

    return (
        <div className="relative h-full w-full bg-[#f0f2f5] dark:bg-gray-950">
            <div
                ref={listRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto p-4 sm:p-6 flex flex-col custom-scrollbar relative"
            >
                {isLoadingMore && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-md rounded-full px-3 py-1 z-10">
                        <span className="text-xs text-gray-500 animate-pulse">Đang tải thêm...</span>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.sender?.id === currentUser?.id;
                    const previousMsg = index > 0 ? messages[index - 1] : null;

                    const showDateSeparator = !previousMsg || !isSameDay(msg.createdAt, previousMsg.createdAt);

                    const showStatus = index === lastMyMessageIndex;

                    return (
                        <React.Fragment key={msg.id || msg.tempId}>
                            {showDateSeparator && (
                                <div className="flex justify-center my-4">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-800/60 px-3 py-1 rounded-full">
                                        {formatDateLabel(msg.createdAt)}
                                    </span>
                                </div>
                            )}

                            <MessageBubble
                                message={msg}
                                isMe={isMe}
                                otherUser={otherUser}
                                showStatus={showStatus} 
                            />
                        </React.Fragment>
                    );
                })}

                <div ref={bottomRef} className="h-1 shrink-0" />
            </div>

            {showNewMessageAlert && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                    <button
                        onClick={scrollToBottom}
                        className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-full
                         shadow-lg hover:bg-brand/90 hover:shadow-xl transition-all text-sm 
                         font-medium animate-bounce"
                    >
                        <ChevronDown className="w-4 h-4" />
                        Tin nhắn mới
                    </button>
                </div>
            )}
        </div>
    );
};

export default MessageList;