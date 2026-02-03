import { getEventById } from "@/services/eventService";
import { HttpStatusCode } from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TicketSelection from "./TicketSelection";
import EventHero from "./EventHero";
import EventOrganizer from "./EventOrganizer";
import { Info, Loader2, MapPin } from "lucide-react";
import Map from "@/components/Map";

const EventDetailPage = () => {
    const [event, setEvent] = useState(null);
    const location = useLocation();
    const eventId = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)

    useEffect(() => {
        const fetchEventById = async () => {
            try {
                const response = await getEventById({ id: eventId })
                if (response.code === HttpStatusCode.Ok) {
                    setEvent(response.result)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchEventById()
    }, [eventId])

    if (!event) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    const isOnline = event.type === 'ONLINE';
    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black pb-20">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <span>Trang chủ</span> / <span>Sự kiện</span> / <span className="text-gray-900 font-medium truncate max-w-[200px]">{event.name}</span>
                </nav>

                <EventHero event={event} />

                <div className=" flex flex-col gap-8">
                    <EventOrganizer organizer={event.appUser} />
                    {/* Description */}
                    <div className="flex flex-col gap-4 bg-white dark:bg-gray-900
                     p-6 rounded-2xl shadow-sm  shadow-sm border border-gray-200 dark:border-gray-800">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Info className="text-blue-600" /> Giới thiệu sự kiện
                        </h3>
                        <div
                            className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                            dangerouslySetInnerHTML={{ __html: event.description }}
                        />
                    </div>

                    {/* Ticket Section */}
                    <TicketSelection
                        sessions={event.eventSessions}
                        event={event}
                    />

                    {/* Map Section */}
                    {!isOnline && event.locationCoordinates && (
                        <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="text-blue-600" /> Địa chỉ
                            </h3>
                            <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-200 border shadow-sm">
                                <Map
                                    lat={event.locationCoordinates.latitude}
                                    lng={event.locationCoordinates.longitude}
                                    address={event.location}
                                />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default EventDetailPage;