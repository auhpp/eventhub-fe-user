import React, { useEffect, useState, useRef } from 'react';
import { BellOff, ChevronDown, Pin, Search, Loader2 } from 'lucide-react';
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import DefaultAvatar from '@/components/DefaultAvatar';
import { MessageStatus } from '@/utils/constant';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ChatSidebar = ({ conversations, activeConversationId, onSelectConversation, currentUser, isLoading,
    searchName,
    userStatusUpdate,
    setSearchName,
    filterType,
    setFilterType,
    hasMore,
    loadMore,
    isFetchingMore
}) => {
    const [onlineUsersMap, setOnlineUsersMap] = useState({});

    const observerTarget = useRef(null);

    useEffect(() => {
        if (userStatusUpdate && userStatusUpdate.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOnlineUsersMap(prev => ({
                ...prev,
                [userStatusUpdate.id]: userStatusUpdate.isOnline
            }));
        }
    }, [userStatusUpdate]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
                    loadMore(); 
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
    }, [hasMore, isLoading, isFetchingMore, loadMore]);

    // find orther user in chat 1 - 1
    const getOtherMember = (conversation) => {
        const member = conversation.conversationMembers?.find(
            (m) => m.appUser?.id !== currentUser?.id
        );
        return member?.appUser;
    };
    const getFilterLabel = () => {
        switch (filterType) {
            case 'UNREAD': return 'Chưa đọc';
            case 'PINNED': return 'Đã Ghim';
            default: return 'Tất cả';
        }
    };
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 ">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Tin nhắn</h2>

                    {/* DROPDOWN FILTER */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 text-sm font-medium 
                            text-gray-600 hover:text-brand dark:text-gray-300 transition-colors">
                                {getFilterLabel()}
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={() => setFilterType('ALL')}
                                className={filterType === 'ALL' ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : ''}
                            >
                                Tất cả
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setFilterType('UNREAD')}
                                className={filterType === 'UNREAD' ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : ''}
                            >
                                Chưa đọc
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="pl-9 bg-gray-100/50 dark:bg-gray-800 border-transparent focus-visible:ring-brand rounded-full h-10"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading && conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm mt-4">Đang tìm kiếm...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm mt-4">Không tìm thấy cuộc trò chuyện nào.</div>
                ) : (
                    <>
                        {conversations.map((conv) => {
                            const otherUser = getOtherMember(conv);
                            const isActive = conv.id === activeConversationId;
                            const latestMsg = conv.latestMessage;
                            const stringName = currentUser.id != latestMsg?.sender?.id ? "" : "Bạn: ";
                            const unSeen = currentUser.id != latestMsg?.sender?.id && latestMsg?.status != MessageStatus.SEEN;

                            const timeString = latestMsg?.createdAt
                                ? new Date(latestMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '';
                            const isOnline = onlineUsersMap[otherUser?.id] !== undefined
                                ? onlineUsersMap[otherUser?.id]
                                : otherUser?.isOnline;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => onSelectConversation(conv)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b
                                        rounded-lg mx-2 mt-1 
                                        border-gray-50 dark:border-gray-800
                                        ${isActive ? 'bg-brand/10 dark:bg-brand/10 ' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                                    `}
                                >
                                    <div className="relative w-max flex-shrink-0">
                                        <Avatar>
                                            <DefaultAvatar user={otherUser} />
                                        </Avatar>
                                        {isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full z-10"></span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1 min-w-0 flex-1 mr-2">
                                                <span className="truncate block">
                                                    {otherUser?.fullName || "Người dùng ẩn danh"}
                                                </span>
                                                {conv.hasNotification === false && (
                                                    <BellOff className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                )}
                                            </h3>
                                            <span className="text-xs text-gray-500 flex-shrink-0 flex items-center gap-1">
                                                {conv.hasPin && <Pin className="w-3 h-3 text-brand" style={{ fill: 'currentColor' }} />}
                                                {timeString}
                                            </span>
                                        </div>
                                        <p className={`text-sm text-gray-500 dark:text-gray-400 truncate ${unSeen ? "font-bold text-gray-900 dark:text-white" : ""}`}>
                                            {latestMsg?.type === 'IMAGE' ? stringName + '[Hình ảnh]' : stringName + (latestMsg?.content || '')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

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
    );
};

export default ChatSidebar;