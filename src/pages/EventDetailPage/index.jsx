import { getEventById } from "@/services/eventService";
import { getAllTags } from "@/services/tagService";
import { HttpStatusCode } from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TicketSelection from "./TicketSelection";
import EventHero from "./EventHero";
import EventOrganizer from "./EventOrganizer";
import { Info, Loader2, MapPin, Tags } from "lucide-react"; 
import Map from "@/components/Map";
import FaceSearch from "./FaceSearch";
import { AuthContext } from "@/context/AuthContex";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicEventGallery from "./PublicEventGallery";
import { isExpiredEventSession } from "@/utils/eventUtils";
import EventReviewsTab from "./EventReviewsTab";
import 'react-quill-new/dist/quill.snow.css';
import { routes } from "@/config/routes";

const EventDetailPage = () => {
    const [event, setEvent] = useState(null);
    const [tags, setTags] = useState([]); 
    const location = useLocation();
    const eventId = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const eventResponse = await getEventById({ id: eventId });
                if (eventResponse.code === HttpStatusCode.Ok) {
                    setEvent(eventResponse.result);
                }

                const tagsResponse = await getAllTags({ eventId: Number(eventId) });
                if (tagsResponse.code === HttpStatusCode.Ok || tagsResponse.result) {
                    setTags(tagsResponse.result || tagsResponse);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchEventDetails();
    }, [eventId]);

    if (!event) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const isOnline = event.type === 'ONLINE';
    const someEventSessionExpired = event.eventSessions.some(es => isExpiredEventSession({ eventSession: es }));

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black pb-20">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <EventHero event={event} />

                {/* TABS SECTION */}
                <div className="mt-8">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-800 
                        rounded-none h-auto bg-transparent p-0 gap-8 mb-6">
                            <TabsTrigger
                                value="info"
                                className="pb-4 pt-2 px-1 rounded-none border-b-2 border-transparent
                                 data-[state=active]:border-primary data-[state=active]:bg-transparent 
                                 data-[state=active]:shadow-none text-base font-medium"
                            >
                                Thông tin sự kiện
                            </TabsTrigger>

                            {!isOnline && event.hasPhotos && (
                                <TabsTrigger
                                    value="photos"
                                    className="pb-4 pt-2 px-1 rounded-none border-b-2 border-transparent 
                                    data-[state=active]:border-primary data-[state=active]:bg-transparent 
                                    data-[state=active]:shadow-none text-base font-medium"
                                >
                                    Thư viện ảnh
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="reviews"
                                className="pb-4 pt-2 px-1 rounded-none border-b-2 border-transparent 
                                data-[state=active]:border-primary data-[state=active]:bg-transparent 
                                data-[state=active]:shadow-none text-base font-medium"
                            >
                                Đánh giá
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: Event Info */}
                        <TabsContent value="info" className="flex flex-col gap-8 focus-visible:outline-none">
                            <EventOrganizer organizer={event.appUser} />

                            {/* Description */}
                            <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 w-full overflow-hidden">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Info className="text-blue-600" /> Giới thiệu sự kiện
                                </h3>

                                <div className="ql-snow w-full">
                                    <div
                                        className="ql-editor text-gray-600 dark:text-gray-300 !p-0 [&_img]:inline-block [&_img]:max-w-full [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 [&_ol]:ml-4 [&_li]:pl-1 whitespace-pre-line"
                                        dangerouslySetInnerHTML={{
                                            __html: event.description ? event.description.replace(/&nbsp;/g, ' ') : ''
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Tags Section */}
                            {tags && tags.length > 0 && (
                                <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 w-full">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Tags className="text-blue-600 w-5 h-5" /> Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                onClick={() => {
                                                    navigate(routes.eventTagSearch.replace(":slug", tag.slug), { state: { name: tag.name } })
                                                }}
                                                key={tag.id}
                                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 
                                                hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-600
                                                 dark:hover:text-blue-400 text-sm font-medium rounded-md transition-colors
                                                 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-blue-200"
                                            >
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ticket Section */}
                            <TicketSelection
                                sessions={event.eventSessions}
                                event={event}
                            />

                            {/* Map Section */}
                            {!isOnline && event.locationCoordinates && (
                                <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm
                                 border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <MapPin className="text-blue-600" /> Địa chỉ
                                    </h3>
                                    <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-200 border 
                                    shadow-sm">
                                        <Map
                                            lat={event.locationCoordinates.latitude}
                                            lng={event.locationCoordinates.longitude}
                                            address={event.location}
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 2: event images */}
                        {!isOnline && event.hasPhotos && (
                            <TabsContent value="photos" className="focus-visible:outline-none min-h-[400px]">
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border 
                                border-gray-200 dark:border-gray-800">

                                    <div className="flex flex-col sm:flex-row justify-between items-start
                                     sm:items-center gap-4 mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white
                                             flex items-center gap-2">
                                                Khoảnh khắc sự kiện
                                            </h3>
                                            <p className="text-muted-foreground mt-1">
                                                Xem lại những hình ảnh đáng nhớ tại sự kiện này.
                                            </p>
                                        </div>

                                        {/* Search button */}
                                        {someEventSessionExpired && user && (
                                            <FaceSearch eventId={eventId} />
                                        )}
                                    </div>

                                    {/* Image list */}
                                    <PublicEventGallery eventId={eventId} />

                                </div>
                            </TabsContent>
                        )}
                        <TabsContent value="reviews" className="focus-visible:outline-none min-h-[400px]">
                            <EventReviewsTab event={event} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default EventDetailPage;