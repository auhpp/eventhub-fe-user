import React, { useEffect, useState, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Users, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';

import DefaultPagination from '@/components/DefaultPagination'; 
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { getCategoryById } from '@/services/categoryService';
import {
    countCategoryFollower,
    createCategoryFollower,
    deleteCategoryFollower,
    getCategoryFollowers
} from '@/services/categoryFollowerService';
import { getEvents, countEvent } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import { AuthContext } from '@/context/AuthContex';
import { EventStatus } from '@/utils/constant';
import EventCard from '@/features/event/EventCard';
import { routes } from '@/config/routes';

const CategoryDetail = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // States for data
    const [category, setCategory] = useState(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [events, setEvents] = useState([]);

    // States for Follow
    const [isFollowing, setIsFollowing] = useState(false);
    const [followRecordId, setFollowRecordId] = useState(null);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // Pagination States
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 10; 
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    // Fetch all data
    useEffect(() => {
        const fetchCategoryData = async () => {
            if (categoryId) {

                setIsLoading(true);
                try {
                    // 1. Get detail category
                    const catRes = await getCategoryById({ categoryId });
                    if (catRes.code === HttpStatusCode.Ok) {
                        setCategory(catRes.result);
                    }

                    // 2. count follower
                    const followCountRes = await countCategoryFollower({ categoryId });
                    if (followCountRes.code === HttpStatusCode.Ok) {
                        setFollowerCount(followCountRes.result);
                    }

                    // 3. get events
                    const eventsRes = await getEvents({
                        request: {
                            categoryIds: [parseInt(categoryId)],
                            status: EventStatus.APPROVED
                        },
                        page: currentPage,
                        size: pageSize
                    });
                    if (eventsRes.code === HttpStatusCode.Ok) {
                        setEvents(eventsRes.result.data);
                        setTotalPages(eventsRes.result.totalPage);
                        setTotalElements(eventsRes.result.totalElements);
                    }

                    // 4. check follow status
                    if (user) {
                        const checkFollowRes = await getCategoryFollowers({
                            categoryId: parseInt(categoryId),
                            userId: user.id
                        });
                        if (checkFollowRes.code === HttpStatusCode.Ok && checkFollowRes.result.data.length > 0) {
                            setIsFollowing(true);
                            setFollowRecordId(checkFollowRes.result.data[0].id);
                        } else {
                            setIsFollowing(false);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching category details:", error);
                    toast.error("Không thể tải dữ liệu danh mục.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (categoryId) {
            fetchCategoryData();
        }
    }, [categoryId, currentPage, user]);

    useEffect(
        () => {
            if (categoryId) {
                const countDataEvent = async () => {
                    const evtCountRes = await countEvent({
                        categoryId: parseInt(categoryId),
                        statuses: [EventStatus.APPROVED]
                    });
                    if (evtCountRes.code === HttpStatusCode.Ok) {
                        setEventCount(evtCountRes.result);
                    }
                }
                countDataEvent()
            }
        }, [categoryId]
    )

    // Handle Follow / Unfollow
    const handleToggleFollow = async () => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để theo dõi danh mục này.");
            navigate(routes.signin);
            return;
        }

        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                // Handle Unfollow
                if (followRecordId) {
                    await deleteCategoryFollower({ id: followRecordId });
                    setIsFollowing(false);
                    setFollowRecordId(null);
                    setFollowerCount(prev => Math.max(0, prev - 1));
                    toast.success("Đã bỏ theo dõi danh mục.");
                }
            } else {
                // Handle Follow
                const res = await createCategoryFollower({
                    categoryId: parseInt(categoryId), userId: user.id
                });
                if (res.code === HttpStatusCode.Ok) {
                    setIsFollowing(true);
                    setFollowerCount(prev => prev + 1);
                    toast.success("Đã theo dõi danh mục.");

                    const checkFollowRes = await getCategoryFollowers({ categoryId, userId: user.id });
                    if (checkFollowRes.code === HttpStatusCode.Ok && checkFollowRes.result.data.length > 0) {
                        setFollowRecordId(checkFollowRes.result.data[0].id);
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái theo dõi:", error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsFollowLoading(false);
        }
    };

    if (isLoading && !category) {
        return (
            <div className="flex justify-center items-center h-[60vh] w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex justify-center items-center h-[60vh] w-full">
                <p className="text-muted-foreground">Không tìm thấy danh mục.</p>
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* --- 1: Category info and stats --- */}
            <div className="rounded-lg bg-card border 
            p-6 sm:p-8 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 rounded-2xl border shadow-sm">
                        <AvatarImage src={category.avatarUrl} alt={category.name} className="object-cover" />
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{category.name}</h1>
                        <p className="text-muted-foreground line-clamp-2 max-w-2xl mb-4">
                            {category.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{followerCount} Người theo dõi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{eventCount} Sự kiện</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Follow/Unfollow Button */}
                <div className="w-full md:w-auto mt-4 md:mt-0">
                    <Button
                        onClick={handleToggleFollow}
                        disabled={isFollowLoading}
                        variant={isFollowing ? "outline" : "default"}
                    >
                        {isFollowLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : isFollowing ? (
                            <>
                                <Check className="mr-2 h-4 w-4" /> Đang theo dõi
                            </>
                        ) : (
                            "Theo dõi"
                        )}
                    </Button>
                </div>
            </div>

            {/* --- 2: Event list --- */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Sự kiện trong {category.name}</h2>

                {events.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                        Chưa có sự kiện nào trong danh mục này.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
                        {events.map(event => (
                            <EventCard key={event.id} event={event} showActionManage={false}
                                userMode={true}
                                onClick={() =>
                                    navigate(routes.eventDetail.replace(":id", event.id))

                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- 3: Pagination --- */}
            {events.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={setSearchParams}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                </div>
            )}
        </section>
    );
};

export default CategoryDetail;