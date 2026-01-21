import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContex';
import { routes } from '@/config/routes';

const LoggedInRoute = ({ path }) => {
    const { user, isLoading, token } = useContext(AuthContext);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if ((path == routes.signin || path == routes.signup) && (token || user)) {
        return <Navigate to={routes.home} />;
    }
    else {
        return <Outlet />
    }
};


export default LoggedInRoute;