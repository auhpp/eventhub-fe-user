import { getCurrentUserInfo } from '@/services/authenticationService';
import { HttpStatusCode } from 'axios';
import { createContext, useEffect, useState } from 'react';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const token = localStorage.getItem("access_token") || "";
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getCurrentUserInfoAuth = async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const data = await getCurrentUserInfo();
            if (data.code === HttpStatusCode.Ok) {
                setUser(data.result);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Lỗi xác thực:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getCurrentUserInfoAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, getCurrentUserInfoAuth, isLoading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};