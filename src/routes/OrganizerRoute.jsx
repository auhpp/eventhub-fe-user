import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContex';
import { routes } from '@/config/routes';
import { RoleName } from '@/utils/constant';
import { getEventStaffByEventId } from '@/services/eventStaffService';
import { HttpStatusCode } from 'axios';
import Forbidden403 from '@/components/Forbidden403'; 

const OrganizerRoute = () => {
    const { user, isLoading, token, isEventStaff } = useContext(AuthContext);
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

    if (
        (user && user.role.name === RoleName.ORGANIZER.key) ||
        (!eventId && isEventStaff) ||
        (eventStaff && eventStaff.role.name === RoleName.EVENT_ADMIN.key && eventStaff.status === "ACTIVE")
    ) {
        return <Outlet />;
    }
    else if (
        eventStaff &&
        eventStaff.status === "ACTIVE" &&
        (eventStaff.role.name === RoleName.EVENT_MANAGER.key || eventStaff.role.name === RoleName.EVENT_STAFF.key)
    ) {
        return <Navigate to={routes.eventAttendee.replace(":id", eventId)} replace />;
    }
    else {
        return <Forbidden403 />; 
    }
};

export default OrganizerRoute;