import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContex';
import { routes } from '@/config/routes';
import { getEventStaffByEventId } from '@/services/eventStaffService';
import { HttpStatusCode } from 'axios';
import Forbidden403 from '@/components/Forbidden403'; 
import { RoleName } from '@/utils/constant';

const EventManagerRoute = () => {
    const { user, isLoading, token } = useContext(AuthContext);
    const { id: eventId } = useParams();

    const [eventStaff, setEventStaff] = useState(null);
    const [eventStaffLoading, setEventStaffLoading] = useState(true);

    useEffect(() => {
        const fetchEventStaff = async () => {
            if (!eventId) {
                setEventStaffLoading(false);
                return;
            }

            try {
                const eventStaffRes = await getEventStaffByEventId({ eventId });

                if (eventStaffRes.code === HttpStatusCode.Ok) {
                    setEventStaff(eventStaffRes.result);
                } else {
                    setEventStaff(null);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin Event Staff:", error);
                setEventStaff(null);
            } finally {
                setEventStaffLoading(false);
            }
        };

        fetchEventStaff();
    }, [eventId]);


    if (isLoading || eventStaffLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to={routes.signin} replace />;
    }

    if (!eventStaff || eventStaff && eventStaff.role.name == RoleName.EVENT_STAFF.key) {
        return <Forbidden403 />
    }

    return <Outlet />;
};

export default EventManagerRoute;