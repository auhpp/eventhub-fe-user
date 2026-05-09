import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Facebook, Twitter, Mail, Youtube, Instagram, Users, Calendar, Star } from 'lucide-react';
import DefaultAvatar from '@/components/DefaultAvatar';
import { RoleName } from '@/utils/constant';
import { getReviewSummary } from '@/services/statsService';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';

const SOCIAL_NETWORKS = [
    { type: "FACEBOOK", label: "Facebook", icon: <Facebook className="w-5 h-5 text-blue-600" /> },
    { type: "YOUTUBE", label: "YouTube", icon: <Youtube className="w-5 h-5 text-red-600" /> },
    { type: "TWITTER", label: "Twitter / X", icon: <Twitter className="w-5 h-5 text-sky-500" /> },
    { type: "INSTAGRAM", label: "Instagram", icon: <Instagram className="w-5 h-5 text-pink-600" /> },
];

const UserProfileHeader = ({
    profileUser,
    isFollowing,
    onToggleFollow,
    isLoadingFollow,
    followersCount,
    eventsCount,
    currentUser
}) => {
    const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });
    const navigate = useNavigate();
    useEffect(() => {
        const fetchReviewStats = async () => {
            if (profileUser?.id && profileUser?.role?.name === RoleName.ORGANIZER.key) {
                try {
                    const res = await getReviewSummary({ organizerId: profileUser.id });
            
                    const data = res.result;
                    setReviewStats({
                        totalReviews: data?.totalReview || 0,
                        averageRating: data?.averageRating || 0
                    });
                } catch (error) {
                    console.error("Lỗi khi tải thông tin đánh giá:", error);
                }
            }
        };

        fetchReviewStats();
    }, [profileUser]);

    if (!profileUser) return null;

    const isOrganizer = profileUser.role.name === RoleName.ORGANIZER.key;

    return (
        <div className="w-full max-w-6xl mx-auto mt-6 pb-2 border-b border-slate-200 px-4 md:px-0">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">

                <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32">
                        <DefaultAvatar user={profileUser} />
                    </Avatar>

                    <div className="text-center md:text-left">
                        <h1 className="text-xl md:text-xl font-bold text-slate-900">
                            {profileUser.fullName}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mt-2 text-sm">
                            <Mail className="w-4 h-4" />
                            <span>{profileUser.email}</span>
                        </div>
                    </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex flex-col items-center md:items-end gap-5 w-full md:w-auto mt-2 md:mt-0">

                    <div className="flex gap-6 md:gap-8 text-center w-full md:w-auto justify-center md:justify-end">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-xl font-bold text-slate-900">{followersCount}</span>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                <Users className="h-4 w-4" />
                                <span>Người theo dõi</span>
                            </div>
                        </div>

                        <div className="w-px bg-slate-200 h-10 my-auto"></div>

                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-xl font-bold text-slate-900">{eventsCount}</span>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                <Calendar className="h-4 w-4" />
                                <span>Sự kiện</span>
                            </div>
                        </div>

                        {isOrganizer && (
                            <>
                                <div className="w-px bg-slate-200 h-10 my-auto"></div>
                                <div className="flex flex-col items-center md:items-end cursor-pointer"
                                    onClick={() => navigate(routes.organizerReview.replace(":organizerId", profileUser.id))}
                                >
                                    <div className="flex items-center gap-1">
                                        <span className="text-xl font-bold text-slate-900">
                                            {Number(reviewStats.averageRating).toFixed(1)}
                                        </span>
                                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                        <span>({reviewStats.totalReviews} đánh giá)</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Follow button */}
                    {isOrganizer && currentUser?.id !== profileUser.id && (
                        <Button
                            variant={isFollowing ? "outline" : "default"}
                            onClick={onToggleFollow}
                            className={`w-full md:w-auto ${isFollowing ? "text-blue-600 border-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                            disabled={isLoadingFollow}
                        >
                            {isLoadingFollow && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            {isFollowing ? 'Đang theo dõi' : '+ Theo dõi'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Profile Bio & Social Links */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="max-w-2xl text-slate-600 text-center md:text-left w-full">
                    <p className="leading-relaxed whitespace-pre-wrap">
                        {profileUser.biography || "Người dùng này chưa cập nhật thông tin giới thiệu."}
                    </p>
                </div>

                {/* Render Social Links  */}
                <div className="flex justify-center md:justify-end gap-2 w-full md:w-auto flex-wrap">
                    {profileUser.socialLinks?.map((link) => {
                        const network = SOCIAL_NETWORKS.find(net => net.type === link.type);

                        if (!network || !link.urlLink) return null;

                        return (
                            <a
                                key={link.id}
                                href={link.urlLink}
                                target="_blank"
                                rel="noreferrer"
                                title={network.label}
                                className="p-2 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center"
                            >
                                {network.icon}
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UserProfileHeader;