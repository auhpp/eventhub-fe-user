import React, { useEffect, useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getEvents } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import EventCard from '@/features/event/EventCard';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { EventStatus } from '@/utils/constant';

const CategeryEvents = ({ categoryId }) => {
    const [events, setEvents] = useState(null)
    const navigate = useNavigate()
    useEffect(
        () => {
            const fetchEvents = async () => {
                try {
                    const response = await getEvents({
                        request: { status: EventStatus.APPROVED, categoryIds: [categoryId] },
                        page: 1, size: 4
                    })
                    if (response.code == HttpStatusCode.Ok) {
                        setEvents(response.result.data)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            fetchEvents()
        }, []
    )


    if (!events) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">{events[0]?.category.name}</h2>
                <button
                    onClick={() => navigate(`/search?categoryId=${categoryId}`)}
                    className="flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-900 transition-colors"
                >
                    Xem thêm <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} showActionManage={false}
                        userMode={true}
                        onClick={() =>
                            navigate(routes.eventDetail.replace(":id", event.id))

                        }
                    />
                ))}
            </div>
        </section>
    );

};

export default CategeryEvents;