import { createFavorite, deleteFavorite, getEventIdFavorite } from '@/services/favoriteService';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContex';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';

const FavoriteContext = createContext();

export const useFavorite = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
    const [favoriteIds, setFavoriteIds] = useState([]);
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/immutability
            fetchFavorites();
        } else {
            setFavoriteIds([]);
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const ids = await getEventIdFavorite();
            console.log("fv", ids.result)
            setFavoriteIds(ids.result);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách yêu thích:", error);
        }
    };

    const toggleFavorite = async (eventId) => {
        if (!user) {
            navigate(routes.signin)
            return;
        }
        const isFavorited = favoriteIds.includes(eventId);

        if (isFavorited) {
            setFavoriteIds((prev) => prev.filter((id) => id !== eventId));
        } else {
            setFavoriteIds((prev) => [...prev, eventId]);
        }

        try {
            if (isFavorited) {
                await deleteFavorite(eventId);
            } else {
                await createFavorite(eventId);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích, đang rollback...", error);
            if (isFavorited) {
                setFavoriteIds((prev) => [...prev, eventId]); 
            } else {
                setFavoriteIds((prev) => prev.filter((id) => id !== eventId)); 
            }
        }
    };

    return (
        <FavoriteContext.Provider value={{ favoriteIds, toggleFavorite, fetchFavorites }}>
            {children}
        </FavoriteContext.Provider>
    );
};