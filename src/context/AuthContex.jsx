import { getCurrentUserInfo, logout } from '@/services/authenticationService';
import { checkIsEventStaff } from '@/services/eventStaffService';
import { HttpStatusCode } from 'axios';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("access_token") || "");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEventStaff, setIsEventStaff] = useState(null);

    const getCurrentUserInfoAuth = async () => {
        const currentToken = localStorage.getItem("access_token");

        if (!currentToken) {
            setIsLoading(false);
            return;
        }

        setToken(currentToken);

        try {
            const [userInfoRes, eventStaffRes] = await Promise.all([
                getCurrentUserInfo(),
                checkIsEventStaff()
            ]);

            if (userInfoRes.code === HttpStatusCode.Ok) {
                setUser(userInfoRes.result);
            } else {
                setUser(null);
            }

            console.log("event staff res", eventStaffRes.result)

            if (eventStaffRes.code === HttpStatusCode.Ok) {
                setIsEventStaff(eventStaffRes.result);
            } else {
                setIsEventStaff(false);
            }

        } catch (error) {
            console.error("Lỗi xác thực:", error);
            setUser(null);
            setIsEventStaff(false);
        } finally {
            setIsLoading(false);
        }
    }

    const logoutAuth = async () => {
        try {
            const response = await logout();
            if (response.code === HttpStatusCode.Ok) {
                localStorage.removeItem("access_token");
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getCurrentUserInfoAuth();
    }, []);

    return (
        <AuthContext.Provider value={{
            token,
            user,
            getCurrentUserInfoAuth,
            isLoading,
            setUser,
            logoutAuth,
            isEventStaff
        }}>
            {children}
        </AuthContext.Provider>
    );
};