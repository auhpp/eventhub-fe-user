import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Mail, Facebook, Youtube, Twitter, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { Avatar } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';

const EventSeriesHeader = ({
    series,
    isFollowing,
    onToggleFollow,
    isLoadingFollow,
    followersCount = 0
}) => {
    const renderSocialIcon = (type) => {
        switch (type) {
            case 'FACEBOOK': return <Facebook className="w-5 h-5" />;
            case 'YOUTUBE': return <Youtube className="w-5 h-5" />;
            case 'TWITTER': return <Twitter className="w-5 h-5" />;
            default: return <Globe className="w-5 h-5" />;
        }
    };
    const navigate = useNavigate();
    return (
        <div className="w-full bg-white border-b mt-6">
            {/* Cover Image */}
            <div className="w-full h-[250px] md:h-[320px] bg-slate-100 relative">
                <img
                    src={series?.coverImage || '/placeholder-cover.jpg'}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-xl"
                />
            </div>

            {/* Info Section */}
            <div className="px-4 md:px-8 relative max-w-7xl mx-auto pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 md:-mt-20">

                    {/* Avatar, Title & Followers */}
                    <div className="flex flex-col items-start z-10">
                        <div className="p-1.5 bg-white rounded-2xl shadow-sm">
                            <img
                                src={series?.avatar || '/placeholder-avatar.png'}
                                alt={series?.name}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover bg-blue-500"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mt-4">
                            {series?.name}
                        </h1>

                        {/* Followers count */}
                        <div className="flex items-center gap-2 mt-2 text-slate-600 font-medium">
                            <Users className="h-4 w-4" />
                            <span>{followersCount} Người theo dõi</span>
                        </div>
                    </div>

                    {/* Follow Button */}
                    <div className="z-10 pb-2">
                        <Button
                            variant={isFollowing ? "outline" : "default"}
                            onClick={onToggleFollow}
                            className={isFollowing ? "text-blue-600 border-blue-600" : "bg-blue-600 text-white"}
                            disabled={isLoadingFollow}
                        >
                            {isLoadingFollow ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (isFollowing ? 'Đã theo dõi' : 'Theo dõi')}
                        </Button>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-4 text-slate-600">
                    <p className="mb-4">{series?.description}</p>
                </div>

                {/* Organizer Info (appUser) */}
                {series?.appUser && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Nhà tổ chức</h3>
                        <div className="flex items-start gap-4"
                        >
                            {/* Organizer Avatar */}
                            <Avatar className="w-14 h-14 cursor-pointer"
                                onClick={() => navigate(routes.userProfileDetail.replace(":id", series.appUser.id))}
                            >
                                <DefaultAvatar user={series.appUser} />
                            </Avatar>

                            {/* Organizer Details */}
                            <div className="flex flex-col">
                                <h4 className="font-medium text-slate-900 text-base cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => navigate(routes.userProfileDetail.replace(":id", series.appUser.id))}

                                >
                                    {series.appUser.fullName}
                                </h4>
                                {series.appUser.biography && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        {series.appUser.biography}
                                    </p>
                                )}

                                {/* Email */}
                                {series.appUser.email && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                        <Mail className="h-4 w-4" />
                                        <a href={`mailto:${series.appUser.email}`} className="hover:text-blue-600 transition-colors">
                                            {series.appUser.email}
                                        </a>
                                    </div>
                                )}

                                {/* Social Links */}
                                {series.appUser.socialLinks && series.appUser.socialLinks.length > 0 && (
                                    <div className="flex items-center gap-3 mt-3">
                                        {series.appUser.socialLinks.map((social) => (
                                            <a
                                                key={social.id}
                                                href={social.urlLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                title={social.type}
                                            >
                                                {renderSocialIcon(social.type)}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventSeriesHeader;