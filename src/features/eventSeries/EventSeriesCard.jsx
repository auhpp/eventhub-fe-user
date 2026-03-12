import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Loader2, ArrowRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from '@/config/routes';
import {
    createEventSeriesFollower,
    deleteEventSeriesFollower,
    getEventSeriesFollowers
} from '@/services/eventSeriesFollowerService';
import { getEvents } from '@/services/eventService';
import { AuthContext } from '@/context/AuthContex';
import { toast } from 'sonner';
import { formatDateTime } from '@/utils/format';

const EventSeriesCard = ({ series, showActionManage, showUpcomingEvents = false }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const isOwner = user && series?.appUser?.id === user?.id;
    const isManagerView = showActionManage || isOwner;

    // States for Follow
    const [isFollowing, setIsFollowing] = useState(false);
    const [followRecordId, setFollowRecordId] = useState(null);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);

    // States for Upcoming Events
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    // 1. check follow status
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!user || isManagerView) return;
            try {
                const response = await getEventSeriesFollowers({
                    eventSeriesId: series.id,
                    userId: user.id,
                    page: 1,
                    size: 1
                });
                if (response?.result?.data?.length > 0) {
                    setIsFollowing(true);
                    setFollowRecordId(response.result.data[0].id);
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra trạng thái follow:", error);
            }
        };
        checkFollowStatus();
    }, [series.id, user, isManagerView]);

    // 2. Fetch upcoming event
    useEffect(() => {
        if (!showUpcomingEvents || !series?.id) return;

        const fetchUpcomingEvents = async () => {
            setIsLoadingEvents(true);
            try {
                const requestBody = {
                    eventSeriesId: series.id,
                    eventSearchStatus: 'COMING'
                };
                const response = await getEvents({
                    request: requestBody,
                    page: 1,
                    size: 2
                });
                setUpcomingEvents(response?.result?.data || []);
            } catch (error) {
                console.error("Lỗi khi tải sự kiện sắp tới:", error);
            } finally {
                setIsLoadingEvents(false);
            }
        };

        fetchUpcomingEvents();
    }, [series.id, showUpcomingEvents]);

    const handleToggleFollow = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.warning("Vui lòng đăng nhập để theo dõi chuỗi sự kiện này.");
            return;
        }

        setIsLoadingFollow(true);
        try {
            if (isFollowing) {
                await deleteEventSeriesFollower({ id: followRecordId });
                setIsFollowing(false);
                setFollowRecordId(null);
            } else {
                const response = await createEventSeriesFollower({
                    eventSeriesId: series.id,
                    userId: user.id
                });
                setIsFollowing(true);
                setFollowRecordId(response?.result?.id);
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái theo dõi:", error);
        } finally {
            setIsLoadingFollow(false);
        }
    };

    return (
        <Card
            onClick={() => {
                if (!isManagerView && !showUpcomingEvents) {
                    navigate(routes.eventSeriesDetail?.replace(":id", series.id));
                }
            }}
            className={`p-4 flex ${showUpcomingEvents ? 'flex-col sm:flex-row gap-6 sm:gap-12' : 'flex-col gap-4'} 
                 rounded-xl border-border/60 shadow-sm transition-all duration-300 
                 ${!isManagerView && !showUpcomingEvents ? 'cursor-pointer group bg-white/50 hover:bg-white hover:shadow-md' : 'bg-white'}`}
        >
            <div className={`flex flex-col gap-4 ${showUpcomingEvents ? 'w-full sm:w-[100px] shrink-0' : 'w-full'}`}>
                <div className="flex justify-between items-start">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm p-2">
                        <img
                            src={series.avatar || '/default-series-avatar.png'}
                            alt={series.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>

                    {/*  Follow button */}
                    {!isManagerView && !showUpcomingEvents && (
                        <Button
                            variant="ghost"
                            size={`${isFollowing ? 'icon' : 'sm'}`}
                            className={`transition-colors ${isFollowing
                                ? 'rounded-full bg-gray-100 text-gray-800 hover:bg-red-50 hover:text-red-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            onClick={handleToggleFollow}
                            disabled={isLoadingFollow}
                        >
                            {isLoadingFollow ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isFollowing ? (
                                <UserCheck className="h-4 w-4" />
                            ) : (
                                <span>Theo dõi</span>
                            )}
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-1 mt-1">
                    <h3 className={`font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors ${showUpcomingEvents ? 'text-xl' : 'text-lg'}`}>
                        {series.name}
                    </h3>

                    {!showUpcomingEvents && (
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                            {series.description || "Chưa có mô tả cho chuỗi sự kiện này."}
                        </p>
                    )}
                </div>

                {/* button see detail */}
                {showUpcomingEvents && (
                    <Button
                        variant="secondary"
                        className="w-fit mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 h-9 px-4 rounded-lg font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(routes.eventSeriesDetail?.replace(":id", series.id));
                        }}
                    >
                        Xem chi tiết <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                )}

                {/* ACTIONS MANAGER */}
                {isManagerView && !showUpcomingEvents && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-9 font-semibold"
                                onClick={(e) => { e.stopPropagation(); navigate(routes.editEventSeries?.replace(":id", series.id)); }}
                            >
                                Chỉnh sửa
                            </Button>
                            <Button
                                className="flex-1 h-9 bg-brand/10 text-brand hover:bg-brand/20 font-semibold shadow-none"
                                onClick={(e) => { e.stopPropagation(); navigate(routes.eventsInEventSeries?.replace(":id", series.id)); }}
                            >
                                Quản lý
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ---- UPCOMING EVENTS ---- */}
            {showUpcomingEvents && (
                <div className="flex-1 flex flex-col justify-center sm:pl-8 pt-4 sm:pt-0">
                    <h4 className="text-gray-400 text-sm font-medium mb-4">Sự kiện sắp tới</h4>

                    <div className="flex flex-col gap-5">
                        {isLoadingEvents ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                            </div>
                        ) : upcomingEvents.length > 0 ? (
                            upcomingEvents.map(ev => {
                                // ---- LOGIC find upcoming SESSION ----
                                let displayTime = null;
                                if (ev.eventSessions && ev.eventSessions.length > 0) {
                                    const now = new Date();

                                    const futureSessions = ev.eventSessions.filter(
                                        session => new Date(session.startDateTime) > now
                                    );

                                    if (futureSessions.length > 0) {
                                        futureSessions.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
                                        displayTime = futureSessions[0].startDateTime;
                                    } else {
                                        const pastSessions = [...ev.eventSessions].sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
                                        displayTime = pastSessions[0].startDateTime;
                                    }
                                }
                                // ---------------------------------------

                                return (
                                    <div key={ev.id} className="flex flex-col gap-1 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(routes.eventDetail?.replace(":id", ev.id));
                                        }}
                                    >
                                        <h5 className="font-medium text-gray-900 text-[15px] hover:text-primary transition-colors">
                                            {ev.name}
                                        </h5>
                                        <span className="text-sm text-gray-400 font-medium tracking-wide">
                                            {formatDateTime(displayTime)}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-sm text-gray-400 italic">Hiện chưa có sự kiện nào sắp diễn ra.</span>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default EventSeriesCard;