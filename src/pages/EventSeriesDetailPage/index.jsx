import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import EventSeriesHeader from './EventSeriesHeader';
import EventFilterBar from './EventFilterBar';
import EventListSection from './EventListSection';
import { getEventSeriesById } from '@/services/eventSeriesService';
import { countEventSeriesFollowers, createEventSeriesFollower, deleteEventSeriesFollower, getEventSeriesFollowers } from '@/services/eventSeriesFollowerService';
import { getEvents } from '@/services/eventService';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '@/context/AuthContex';

const EventSeriesDetailPage = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // State for Event Series
    const [series, setSeries] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followRecordId, setFollowRecordId] = useState(null);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);

    // State for Events & Filters
    const [events, setEvents] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState({
        name: '',
        eventSearchStatus: searchParams.get('status') || 'COMING',
        fromDate: null,
        toDate: null,
        page: parseInt(searchParams.get('page')) || 1,
        size: 9
    });

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!user) return;

            try {
                const response = await getEventSeriesFollowers({
                    eventSeriesId: id,
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
    }, [id, user]);

    // 1. Fetch Event Series Detail & Follower Info
    useEffect(() => {
        const fetchSeriesData = async () => {
            try {
                const seriesData = await getEventSeriesById({ id });
                setSeries(seriesData.result);

                const count = await countEventSeriesFollowers({ eventSeriesId: id, userId: user.id });
                setFollowersCount(count.result || 0);
            } catch (error) {
                console.error("Lỗi khi tải thông tin Series", error);
            }
        };
        if (id) fetchSeriesData();
    }, [id]);

    // 2. Fetch Events based on filters
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const requestBody = {
                    eventSeriesId: id,
                    name: filters.name,
                    eventSearchStatus: filters.eventSearchStatus,
                    fromDate: filters.fromDate,
                    toDate: filters.toDate
                };
                const response = await getEvents({
                    request: requestBody,
                    page: filters.page,
                    size: filters.size
                });
                setEvents(response.result.data || []);
                setTotalPages(response.result.totalPage || 1);
                setTotalElements(response.result.totalElements || 0);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sự kiện", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [id, filters]);

    // Handler: Toggle Follow
    const handleToggleFollow = async () => {
        try {
            setIsLoadingFollow(true);

            if (isFollowing) {
                await deleteEventSeriesFollower({ id: followRecordId });
                setIsFollowing(false);
                setFollowRecordId(null);
            } else {
                const response = await createEventSeriesFollower({ eventSeriesId: id, userId: user.id });
                setIsFollowing(true);
                setFollowRecordId(response?.result?.id);
            }
        } catch (error) {
            console.error("Lỗi khi theo dõi", error);
        } finally {
            setIsLoadingFollow(false);
        }
    };

    if (!series) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <EventSeriesHeader
                series={series}
                isFollowing={isFollowing}
                onToggleFollow={handleToggleFollow}
                followersCount={followersCount}
                isLoadingFollow={isLoadingFollow}
            />

            <div className="mt-8 px-4 md:px-8">
                <EventFilterBar filters={filters} setFilters={setFilters} />

                <div className="mt-6">
                    {isLoading ? (
                        <div className="text-center py-10">Đang tải sự kiện...</div>
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

export default EventSeriesDetailPage;