import React, { useEffect, useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getEvents } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import EventCard from '@/features/event/EventCard';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { EventStatus } from '@/utils/constant';

const FeaturedEvents = () => {
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('thisWeek');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const requestPayload = {
                    status: EventStatus.APPROVED,
                    thisWeek: activeTab === 'thisWeek' ? true : undefined,
                    thisMonth: activeTab === 'thisMonth' ? true : undefined,
                };

                const response = await getEvents({ request: requestPayload, page: 1, size: 4 });

                if (response.code === HttpStatusCode.Ok) {
                    setEvents(response.result.data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [activeTab]);

    return (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8 bg-white">
            {/* tabs */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex space-x-6">
                    <button
                        onClick={() => setActiveTab('thisWeek')}
                        className={`relative pb-2 text-lg font-bold transition-colors ${activeTab === 'thisWeek'
                            ? 'text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Tuần này
                        {activeTab === 'thisWeek' && (
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-md"></span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('thisMonth')}
                        className={`relative pb-2 text-lg font-bold transition-colors ${activeTab === 'thisMonth'
                            ? 'text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Tháng này
                        {activeTab === 'thisMonth' && (
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-md"></span>
                        )}
                    </button>
                </div>

                <button
                    onClick={() => navigate(`/search?time=${activeTab}`)}
                    className="flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-900 transition-colors"
                >
                    Xem thêm <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Event list */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 w-full">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1db954]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <EventCard
                                userMode={true}
                                key={event.id}
                                event={event}
                                showActionManage={false}
                                onClick={() => navigate(routes.eventDetail.replace(":id", event.id))}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            Không có sự kiện nào trong thời gian này.
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default FeaturedEvents;