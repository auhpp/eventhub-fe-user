import { getEventById } from '@/services/eventService';
import { getEventStaffByEventId } from '@/services/eventStaffService';
import { HttpStatusCode } from 'axios';
import { Loader2 } from 'lucide-react';
import { createContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [event, setEvent] = useState(null);
    const { id } = useParams()
    const [eventStaff, setEventStaff] = useState(null);


    const getEventInit = async () => {
        try {
            const data = await getEventById({ id: id });
            if (data.code === HttpStatusCode.Ok) {
                setEvent(data.result);
            } else {
                setEvent(null);
            }
            const eventStaffRes = await getEventStaffByEventId({ eventId: id });
            if (eventStaffRes.code === HttpStatusCode.Ok) {
                setEventStaff(eventStaffRes.result);
            } else {
                setEventStaff(null);
            }
        } catch (error) {
            console.error(error);
            setEvent(null);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getEventInit();
    }, [id]);

    if (!event) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }


    return (
        <EventContext.Provider value={{ event, getEventInit, eventStaff }}>
            {children}
        </EventContext.Provider>
    );
};