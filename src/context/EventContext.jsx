import { getEventById } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import { Loader2 } from 'lucide-react';
import { createContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


export const EventContext = createContext();

export const EventProvider = ({ children }) => {

    const [event, setEvent] = useState(null);
    const { id } = useParams()


    useEffect(() => {
        const getEventInit = async () => {
            try {
                const data = await getEventById({ id: id });
                if (data.code === HttpStatusCode.Ok) {
                    setEvent(data.result);
                } else {
                    setEvent(null);
                }
            } catch (error) {
                console.error(error);
                setEvent(null);
            }
        }
        getEventInit();
    }, []);

    if (!event) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }


    return (
        <EventContext.Provider value={{ event }}>
            {children}
        </EventContext.Provider>
    );
};