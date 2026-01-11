import { createContext } from 'react';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const token = localStorage.getItem("access_token") || "";

    return (
        <AuthContext.Provider value={{ token }}>
            {children}
        </AuthContext.Provider>
    );
};