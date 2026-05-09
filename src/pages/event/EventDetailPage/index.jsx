import { getEventById } from "@/services/eventService";
import { getAllTags } from "@/services/tagService";
import { checkAttendance } from "@/services/attendeeService";
import { HttpStatusCode } from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "info"; 

    const [isAttendee, setIsAttendee] = useState(false);

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

    useEffect(() => {
        const verifyAttendance = async () => {
            if (user && event?.accessImage === "ATTENDEE") {
                try {
                    const response = await checkAttendance({ eventId });
                    setIsAttendee(response.result);
                } catch (error) {
                    console.error("Lỗi khi kiểm tra quyền tham gia:", error);
                    setIsAttendee(false);
                }
            }
        };

        if (event) {
            verifyAttendance();
        }
    }, [user, event, eventId]);

    if (!event) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-50/50 dark:bg-black gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse">Đang tải thông tin sự kiện...</p>
            </div>
        );
    }

    const isOnline = event.type === 'ONLINE';
    const someEventSessionExpired = event.eventSessions?.some(es => isExpiredEventSession({ endDateTime: es.endDateTime }));

    const canViewAndSearchImages = event.accessImage === "PUBLIC" || (event.accessImage === "ATTENDEE" && isAttendee);
    const showFaceSearch = someEventSessionExpired && user && canViewAndSearchImages && event.accessImage !== "PRIVATE";

    const handleTabChange = (value) => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("tab", value);
            return newParams;
        }, { replace: true }); 
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black pb-20">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <EventHero event={event} />

                {/* TABS SECTION */}
                <div className="mt-10">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-800 rounded-none h-auto bg-transparent p-0 gap-8 mb-8 overflow-x-auto hide-scrollbar">
                            <TabsTrigger
                                value="info"
                                className="pb-4 pt-2 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base font-medium whitespace-nowrap transition-all"
                            >
                                Thông tin sự kiện
                            </TabsTrigger>

                            {!isOnline && (
                                <TabsTrigger
                                    value="photos"
                                    className="pb-4 pt-2 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base font-medium whitespace-nowrap transition-all"
                                >
                                    Thư viện ảnh
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="reviews"
                                className="pb-4 pt-2 px-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base font-medium whitespace-nowrap transition-all"
                            >
                                Đánh giá
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: Event Info */}
                        <TabsContent value="info" className="flex flex-col gap-8 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <EventOrganizer organizer={event.appUser} />

                            {/* Description */}
                            <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full overflow-hidden transition-all hover:shadow-md">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Info className="text-blue-600 w-6 h-6" /> Giới thiệu sự kiện
                                </h3>

                                <div className="ql-snow w-full">
                                    <div
                                        className="ql-editor text-gray-600 dark:text-gray-300 !p-0 [&_img]:inline-block [&_img]:max-w-full [&_img]:rounded-lg [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 [&_ol]:ml-4 [&_li]:pl-1 whitespace-pre-line text-base leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: event.description ? event.description.replace(/&nbsp;/g, ' ') : ''
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Tags Section */}
                            {tags && tags.length > 0 && (
                                <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full transition-all hover:shadow-md">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Tags className="text-blue-600 w-5 h-5" /> Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tags.map((tag) => (
                                            <span
                                                onClick={() => {
                                                    navigate(routes.eventTagSearch.replace(":slug", tag.slug), { state: { name: tag.name } })
                                                }}
                                                key={tag.id}
                                                className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium rounded-full transition-all cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-blue-200"
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
                                <div className="flex flex-col gap-5 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <MapPin className="text-blue-600 w-6 h-6" /> Địa chỉ
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                                        {event.location}
                                    </p>
                                    <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
                                        <Map
                                            lat={event.locationCoordinates.latitude}
                                            lng={event.locationCoordinates.longitude}
                                            address={event.location}
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 2: Event Images */}
                        {!isOnline && (
                            <TabsContent value="photos" className="focus-visible:outline-none min-h-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <PublicEventGallery
                                        eventSessions={event.eventSessions}
                                        currentUser={user}
                                        accessImage={event.accessImage}
                                        eventId={eventId}
                                        showFaceSearch={showFaceSearch} 
                                    />
                                </div>
                            </TabsContent>
                        )}

                        {/* TAB 3: Reviews */}
                        <TabsContent value="reviews" className="focus-visible:outline-none min-h-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <EventReviewsTab event={event} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default EventDetailPage;