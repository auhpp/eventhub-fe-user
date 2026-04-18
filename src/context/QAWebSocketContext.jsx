import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { AuthContext } from './AuthContex';

export const QAWebSocketContext = createContext(null);

export const QAWebSocketProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!currentUser || !token) {
            console.log("Chưa đăng nhập hoặc không có token. Ngắt kết nối QA WS (nếu có).");
            return;
        }

        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/ws`;

        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            // Bật lên nếu muốn debug
            // debug: (str) => {
            //     console.log('STOMP QA Debug:', str);
            // },

            onConnect: () => {
                console.log("Đã kết nối STOMP QA thành công!");
                setIsConnected(true);
            },

            onStompError: (frame) => {
                console.error('Lỗi STOMP QA Backend trả về:', frame.headers['message']);
                console.error('Chi tiết lỗi:', frame.body);
                setIsConnected(false);
            },

            onWebSocketError: (event) => {
                console.error('Lỗi mất mạng hoặc CORS QA WS:', event);
                setIsConnected(false);
            },

            onDisconnect: () => {
                console.log("Đã ngắt kết nối QA WS");
                setIsConnected(false);
            }
        });

        client.activate();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStompClient(client);

        return () => {
            console.log("Đóng kết nối WebSocket QA");
            client.deactivate();
        };
    }, [currentUser]);

    return (
        <QAWebSocketContext.Provider value={{ stompClient, isConnected }}>
            {children}
        </QAWebSocketContext.Provider>
    );
};