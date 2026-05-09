import React, { useState } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { MoreVertical, Trash2, User, Unlock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DefaultAvatar from '@/components/DefaultAvatar';
import { disableConversation } from '@/services/conversationService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import ConfirmDialog from '@/components/ConfirmDialog';

const ChatHeader = ({ otherUser, conversation, onDisabled, currentUser, isBlockedByMe, onUnblock }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const navigate = useNavigate();

    const handleOpenConfirm = () => {
        if (!conversation?.id || conversation.isVirtual) return;
        setIsConfirmOpen(true);
    };

    const handleConfirmDisable = async () => {
        const currentMember = conversation.conversationMembers?.find(
            (m) => m.appUser?.id === currentUser?.id
        );

        if (!currentMember) {
            console.error("Không tìm thấy thành viên hiện tại trong cuộc trò chuyện.");
            setIsConfirmOpen(false);
            return;
        }

        try {
            setIsLoading(true);
            await disableConversation({ memberId: currentMember.id });
            setIsConfirmOpen(false);
            if (onDisabled) onDisabled();
        } catch (error) {
            console.error("Lỗi khi chặn cuộc trò chuyện:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatLastSeen = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'vài giây trước';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
    };

    const isOnline = otherUser?.isOnline;
    const lastSeenText = otherUser?.lastSeen ? formatLastSeen(otherUser.lastSeen) : '';

    return (
        <>
            <div className="h-16 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-gray-100 dark:border-gray-800">
                            <DefaultAvatar user={otherUser} />
                        </Avatar>
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-[15px] leading-tight">
                            {otherUser?.fullName || "Người dùng"}
                        </h3>
                        {isOnline ? (
                            <p className="text-[12px] text-green-500 font-medium">Đang hoạt động</p>
                        ) : (
                            <p className="text-[12px] text-gray-500">
                                {lastSeenText ? `Hoạt động ${lastSeenText}` : 'Ngoại tuyến'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                    {!conversation?.isVirtual && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:text-brand hover:bg-gray-100" disabled={isLoading}>
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">

                                <DropdownMenuItem onClick={() =>
                                    navigate(routes.userProfileDetail.replace(":id", otherUser.id))
                                } className="cursor-pointer">
                                    <User className="w-4 h-4 mr-2" /> Xem trang cá nhân
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {isBlockedByMe ? (
                                    <DropdownMenuItem onClick={onUnblock} className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20">
                                        <Unlock className="w-4 h-4 mr-2" /> Bỏ chặn trò chuyện
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={handleOpenConfirm} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                                        <Trash2 className="w-4 h-4 mr-2" /> Chặn cuộc trò chuyện
                                    </DropdownMenuItem>
                                )}

                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={handleConfirmDisable}
                title="Chặn cuộc trò chuyện"
                description="Bạn có chắc chắn muốn chặn và ẩn cuộc trò chuyện này không? Hành động này sẽ vô hiệu hóa cuộc trò chuyện."
                confirmLabel="Chặn ngay"
                cancelLabel="Hủy"
                variant="destructive"
                isLoading={isLoading}
            />
        </>
    );
};

export default ChatHeader;