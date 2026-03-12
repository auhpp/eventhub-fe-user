import { getEventSeriesById } from '@/services/eventSeriesService';
import { HttpStatusCode } from 'axios';
import { Loader2 } from 'lucide-react';
import { createContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


export const EventSeriesContext = createContext();

export const EventSeriesProvider = ({ children }) => {

    const [eventSeries, setEventSeries] = useState(null);
    const { id } = useParams()
    const getEventSeriesInit = async () => {
        try {
            const data = await getEventSeriesById({ id: id });
            if (data.code === HttpStatusCode.Ok) {
                setEventSeries(data.result);
            } else {
                setEventSeries(null);
            }
        } catch (error) {
            console.error(error);
            setEventSeries(null);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getEventSeriesInit();
    }, []);

    if (!eventSeries) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }


    return (
        <EventSeriesContext.Provider value={{ eventSeries, getEventSeriesInit }}>
            {children}
        </EventSeriesContext.Provider>
    );
};