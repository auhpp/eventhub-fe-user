import { useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { markMessageReceived, receiveAllMessageInConversation } from '@/services/messageService';
import { AuthContext } from '@/context/AuthContex';

export const useChatWebSocket = () => {
    const [realtimeMessage, setRealtimeMessage] = useState(null);
    const [realtimeStatus, setRealtimeStatus] = useState(null);
    const [userStatusUpdate, setUserStatusUpdate] = useState(null);
    const { user: currentUser } = useContext(AuthContext);
    // Listen WebSocket
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!currentUser || !token) {
            console.log("Chưa đăng nhập hoặc không có token. Ngắt kết nối WS (nếu có).");
            return;
        }

        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/ws`;
        let pingInterval;
        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            // debug: (str) => {
            //     console.log('STOMP Debug:', str);
            // },

            onConnect: () => {
                console.log("Đã kết nối STOMP thành công!");

                const channel = `/user/queue/messages`;
                console.log("Đang Subscribe vào channel:", channel);

                // 1. Topic: receive new message
                client.subscribe('/user/queue/messages', (message) => {
                    if (message.body) {
                        const newMsg = JSON.parse(message.body);
                        setRealtimeMessage(newMsg);
                        markMessageReceived(newMsg.id).catch(console.error);
                    }
                });

                // 2. Topic: update message status (Seen / Received)
                client.subscribe('/user/queue/message-status', (message) => {
                    if (message.body) {
                        const statusUpdate = JSON.parse(message.body);
                        setRealtimeStatus(statusUpdate);
                        console.log(statusUpdate)
                    }
                });

                // 3. listen Online/Offline status of users
                client.subscribe('/topic/public/user-status', (message) => {
                    if (message.body) {
                        const statusData = JSON.parse(message.body);
                        setUserStatusUpdate(statusData);
                        if (statusData.id == currentUser.id && statusData.isOnline) {
                            receiveAllMessageInConversation()
                        }
                        console.log(statusData)
                    }
                });
                // 4. connection keep-alive by sending ping every 3 minutes
                pingInterval = setInterval(() => {
                    if (client.connected) {
                        client.publish({ destination: '/app/ping' });
                    }
                }, 3 * 60 * 1000); // 3 minutes
            },
            onStompError: (frame) => {
                console.error('Lỗi STOMP Backend trả về:', frame.headers['message']);
                console.error('Chi tiết lỗi:', frame.body);
            },
            onWebSocketError: (event) => {
                console.error('Lỗi mất mạng hoặc CORS WS:', event);
            }
        });

        client.activate();

        return () => {
            console.log("Đóng kết nối WebSocket");
            if (pingInterval) clearInterval(pingInterval);
            client.deactivate();
        };
    }, [currentUser]);

    return { realtimeMessage, realtimeStatus, userStatusUpdate };
};