import React, { useState, useEffect, useContext } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { findByOtherMember } from '@/services/conversationService';

import {
    createUserFollower,
    deleteUserFollower,
    getUserFollowers
} from '@/services/userFollowerService';
import { AuthContext } from '@/context/AuthContex';

const EventOrganizer = ({ organizer }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);

    const [isMessaging, setIsMessaging] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);
    const [followRecordId, setFollowRecordId] = useState(null);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    if (!organizer) return null;

    // 1. check follow status when load organizer info 
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!organizer?.id || !currentUser?.id) return;

            try {
                const res = await getUserFollowers({
                    followerId: currentUser.id,
                    followedId: organizer.id,
                    page: 1,
                    size: 1
                });

                const followersList = res?.result?.data;

                if (followersList && followersList.length > 0) {
                    setIsFollowing(true);
                    setFollowRecordId(followersList[0].id);
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra trạng thái follow:", error);
            }
        };

        checkFollowStatus();
    }, [organizer?.id, currentUser?.id]);

    // 2. handle follow/unfollow
    const handleFollowToggle = async () => {
        if (!currentUser?.id) {
            navigate(routes.signin)
            return;
        }

        try {
            setIsFollowLoading(true);

            if (isFollowing) {
                if (followRecordId) {
                    await deleteUserFollower({ id: followRecordId });
                    setIsFollowing(false);
                    setFollowRecordId(null);
                }
            } else {
                const res = await createUserFollower({
                    followerId: currentUser.id,
                    followedId: organizer.id
                });

                setIsFollowing(true);
                const newRecordId = res?.data?.id || res?.result?.id;
                setFollowRecordId(newRecordId);
            }
        } catch (error) {
            console.error("Lỗi khi thao tác theo dõi:", error);
        } finally {
            setIsFollowLoading(false);
        }
    };

    // 3. handle click message button
    const handleMessageClick = async () => {
        if (!organizer?.id) return;
        try {
            setIsMessaging(true);
            const res = await findByOtherMember({ otherMemberId: organizer.id });
            const existingConversationId = res?.result?.id;

            if (existingConversationId) {
                navigate(`${routes.chat}?id=${existingConversationId}`);
            } else {
                navigate(routes.chat, { state: { targetUser: organizer } });
            }
        } catch (error) {
            console.log("Chưa có cuộc trò chuyện hoặc có lỗi xảy ra:", error);
            navigate(routes.chat, { state: { targetUser: organizer } });
        } finally {
            setIsMessaging(false);
        }
    };

    const handleProfileClick = () => {
        if (!organizer?.id) return;
        navigate(routes.userProfileDetail.replace(":id", organizer.id));
    };

    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">

            {/*  PROFILE */}
            <div
                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleProfileClick}
            >
                <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                        <AvatarImage src={organizer.avatar} alt={organizer.fullName} />
                        <AvatarFallback>{organizer.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-md">
                        {organizer.fullName}
                    </h3>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* message button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-lg min-w-[100px]"
                    onClick={handleMessageClick}
                    disabled={isMessaging}
                >
                    {isMessaging ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <MessageCircle className="w-4 h-4" />
                    )}
                    {isMessaging ? "Đang mở..." : "Nhắn tin"}
                </Button>

                {/* follow button */}
                <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    className={`gap-2 rounded-lg min-w-[110px] ${!isFollowing ?
                        'bg-brand hover:bg-brand/90 text-white' : ''}`}
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                >
                    {isFollowLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    {isFollowLoading ? "Đang xử lý..." : isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </Button>
            </div>
        </div>
    );
};

export default EventOrganizer;