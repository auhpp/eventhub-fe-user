import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Facebook, Twitter, Mail, Youtube, Instagram, Users, Calendar } from 'lucide-react'; // Đã thêm Users và Calendar
import DefaultAvatar from '@/components/DefaultAvatar';

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
    eventsCount
}) => {
    if (!profileUser) return null;

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

                    <div className="flex gap-8 text-center w-full md:w-auto justify-center md:justify-end">
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
                    </div>

                    {/* Follow button */}
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