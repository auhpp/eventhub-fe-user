import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContex';
import { Loader2 } from 'lucide-react';
import {
    createUserFollower,
    deleteUserFollower,
    getUserFollowers,
    countUserFollowers
} from '@/services/userFollowerService';
import { getEvents, countEvent } from '@/services/eventService';
import { getUserById } from '@/services/userService';
import UserProfileHeader from './UserProfileHeader';
import EventFilterBar from '@/pages/eventSeries/EventSeriesDetailPage/EventFilterBar';
import EventListSection from '@/pages/eventSeries/EventSeriesDetailPage/EventListSection';
import { routes } from '@/config/routes';
import { EventStatus } from '@/utils/constant';

const UserProfilePage = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);

    // State for Profile User & Follow
    const [profileUser, setProfileUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [eventsCount, setEventsCount] = useState(0);
    const [followRecordId, setFollowRecordId] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);

    // State cho Events & Filters
    const [events, setEvents] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    const [filters, setFilters] = useState({
        name: '',
        eventSearchStatus: searchParams.get('status') || 'COMING',
        fromDate: null,
        toDate: null,
        page: parseInt(searchParams.get('page')) || 1,
        size: 8
    });


    useEffect(() => {
        const fetchUserProfileAndStats = async () => {
            setIsLoadingProfile(true);
            try {
                const userRes = await getUserById({ id: id });
                setProfileUser(userRes?.result);

                const followersRes = await countUserFollowers({ followedId: id });
                setFollowersCount(followersRes?.result ?? 0);

                const eventsCountRes = await countEvent({
                    organizerId: id,
                    statuses: [EventStatus.APPROVED]
                });
                setEventsCount(eventsCountRes?.result ?? 0);

            } catch (error) {
                console.error("Lỗi khi tải thông tin người dùng", error);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (id) fetchUserProfileAndStats();
    }, [id]);

    // check follow status
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!currentUser?.id || !id || currentUser.id.toString() === id.toString()) return;

            try {
                const response = await getUserFollowers({
                    followerId: currentUser.id,
                    followedId: id,
                    page: 1,
                    size: 1
                });

                const followersList = response?.result?.data;
                if (followersList && followersList.length > 0) {
                    setIsFollowing(true);
                    setFollowRecordId(followersList[0].id);
                } else {
                    setIsFollowing(false);
                    setFollowRecordId(null);
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra trạng thái follow:", error);
            }
        };

        checkFollowStatus();
    }, [id, currentUser]);

    // Fetch evnents with filters
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoadingEvents(true);
            try {
                const requestBody = {
                    userId: id,
                    name: filters.name || undefined,
                    eventSearchStatus: filters.eventSearchStatus,
                    fromDate: filters.fromDate,
                    toDate: filters.toDate,
                    status: EventStatus.APPROVED
                };

                const response = await getEvents({
                    request: requestBody,
                    page: filters.page,
                    size: filters.size
                });

                const resultData = response?.result;
                setEvents(resultData?.data || []);
                setTotalPages(resultData?.totalPage || 1);
                setTotalElements(resultData?.totalElements || 0);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sự kiện", error);
            } finally {
                setIsLoadingEvents(false);
            }
        };

        if (id) fetchEvents();
    }, [id, filters]);

    // handle Toggle Follow
    const handleToggleFollow = async () => {
        if (!currentUser) {
            navigate(routes.signin);
            return;
        }

        try {
            setIsLoadingFollow(true);

            if (isFollowing) {
                await deleteUserFollower({ id: followRecordId });
                setIsFollowing(false);
                setFollowRecordId(null);
                setFollowersCount(prev => Math.max(0, prev - 1));
            } else {
                const response = await createUserFollower({ followerId: currentUser.id, followedId: id });
                setIsFollowing(true);
                setFollowRecordId(response?.result?.id);
                setFollowersCount(prev => prev + 1); 
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái theo dõi", error);
        } finally {
            setIsLoadingFollow(false);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="text-center py-20 text-slate-500 text-lg">
                Không tìm thấy thông tin người dùng.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12 px-4 md:px-0">
            <UserProfileHeader
                profileUser={profileUser}
                isFollowing={isFollowing}
                onToggleFollow={handleToggleFollow}
                isLoadingFollow={isLoadingFollow}
                followersCount={followersCount}
                eventsCount={eventsCount}
            />

            <div className="mt-6">
                <EventFilterBar filters={filters} setFilters={setFilters} />

                <div className="mt-6">
                    {isLoadingEvents ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <EventListSection
                            events={events}
                            currentPage={filters.page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={filters.size}
                            setSearchParams={setSearchParams}
                            navigate={navigate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;