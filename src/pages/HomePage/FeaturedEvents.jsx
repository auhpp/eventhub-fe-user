import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { getEvents } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import EventCard from '@/features/event/EventCard';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { EventStatus } from '@/utils/constant';

const FeaturedEvents = () => {
    const [events, setEvents] = useState(null)
    const navigate = useNavigate()
    useEffect(
        () => {
            const fetchEvents = async () => {
                try {
                    const response = await getEvents({ request: { status: EventStatus.APPROVED }, page: 1, size: 4 })
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
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Sự kiện nổi bật</h2>
                <a href="#" className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
                    Xem tất cả <ArrowRight className="h-4 w-4" />
                </a>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} showActionManage={false}
                        onClick={() =>
                            navigate(routes.eventDetail.replace(":id", event.id))

                        }
                    />
                ))}
            </div>
        </section>
    );
};

export default FeaturedEvents;