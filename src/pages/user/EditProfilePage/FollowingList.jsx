import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContex";
import { getUserFollowers, countUserFollowers, deleteUserFollower } from "@/services/userFollowerService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserMinus } from "lucide-react";
import BoringAvatar from "boring-avatars";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { routes } from "@/config/routes";

const FollowingList = () => {
    const { user } = useContext(AuthContext);
    const [followingList, setFollowingList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [unfollowingId, setUnfollowingId] = useState(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.id) return;
        fetchInitialData();
    }, [user?.id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const countRes = await countUserFollowers({ followerId: user.id });
            setTotalCount(countRes?.result ?? 0);

            const res = await getUserFollowers({ followerId: user.id, page: 1, size: pageSize });
            const items = res?.result?.data || [];

            setFollowingList(items);
            setHasMore(items.length === pageSize);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách đang theo dõi");
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            const res = await getUserFollowers({ followerId: user.id, page: nextPage, size: pageSize });
            const newItems = res?.result?.data || [];

            setFollowingList(prev => [...prev, ...newItems]);
            setPage(nextPage);
            setHasMore(newItems.length === pageSize);
        } catch (error) {
            console.log(error);
            toast.error("Lỗi khi tải thêm dữ liệu");
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleUnfollow = async (followRecordId) => {
        setUnfollowingId(followRecordId);
        try {
            await deleteUserFollower({ id: followRecordId });

            setFollowingList(prev => prev.filter(item => item.id !== followRecordId));

            setTotalCount(prev => Math.max(0, prev - 1));

            toast.success("Đã bỏ theo dõi tài khoản");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi bỏ theo dõi");
        } finally {
            setUnfollowingId(null);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full shadow-md min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </Card>
        );
    }

    const handleViewProfile = (organizerId) => {
        navigate(routes.userProfileDetail.replace(":id", organizerId));
    };

    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Đang theo dõi
                    <span className="bg-gray-100 text-brand text-sm py-1 px-3 rounded-full">
                        {totalCount}
                    </span>
                </CardTitle>
                <CardDescription>
                    Danh sách các tài khoản mà bạn đang theo dõi.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {followingList.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Bạn chưa theo dõi tài khoản nào.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {followingList.map((item) => {
                            const followedUser = item.followed;
                            if (!followedUser) return null;

                            const isUnfollowingThis = unfollowingId === item.id;

                            return (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">

                                    <div
                                        className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                                        onClick={() => handleViewProfile(followedUser.id)}
                                    >
                                        <Avatar className="w-14 h-14 border shrink-0">
                                            <AvatarImage src={followedUser.avatar} alt={followedUser.fullName} className="object-cover" />
                                            <AvatarFallback className="bg-transparent">
                                                <BoringAvatar size="100%" name={followedUser.email || 'default'} variant="beam" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 hover:text-brand transition-colors truncate">
                                                {followedUser.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-500 max-w-[200px] md:max-w-md truncate">
                                                {followedUser.biography || followedUser.email}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isUnfollowingThis}
                                        className="hidden sm:flex text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 ml-4 shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnfollow(item.id);
                                        }}
                                    >
                                        {isUnfollowingThis ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <UserMinus className="w-4 h-4 mr-2" />
                                        )}
                                        Bỏ theo dõi
                                    </Button>
                                </div>
                            );
                        })}

                        {hasMore && (
                            <div className="flex justify-center pt-6">
                                <Button
                                    variant="ghost"
                                    onClick={loadMore}
                                    disabled={isLoadingMore}
                                    className="text-brand hover:text-brand hover:bg-blue-50"
                                >
                                    {isLoadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Tải thêm
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FollowingList;