import { useEffect, useState, useCallback, useContext } from 'react';
import { Client } from '@stomp/stompjs';
import { toast } from 'sonner';
import { AuthContext } from '@/context/AuthContex';
import {
    deleteNotification,
    getNotifications,
    seenNotification,
    countUnseenNotification
} from '@/services/notificationService';

export const useNotifications = (initialPage = 1, initialSize = 10) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pageInfo, setPageInfo] = useState({ page: initialPage, totalPages: 1, totalElements: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const res = await countUnseenNotification();
            const count = res.result !== undefined ? res.result : res;
            setUnreadCount(Number(count) || 0);
        } catch (error) {
            console.error("Lỗi đếm số thông báo chưa đọc:", error);
        }
    }, [user]);

    const fetchNotifications = useCallback(async (page, size) => {
        setIsLoading(true);
        try {
            const res = await getNotifications({ page, size });
            setNotifications(res.result.data);
            setPageInfo({
                page: res.result.currentPage,
                totalPages: res.result.totalPage,
                totalElements: res.result.totalElements
            });

            fetchUnreadCount();
        } catch (error) {
            console.error("Lỗi tải thông báo:", error);
            toast.error("Không thể tải thông báo");
        } finally {
            setIsLoading(false);
        }
    }, [fetchUnreadCount]);

    // Listen WebSocket
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!user || !user.id || !token) {
            console.warn("Chưa đủ điều kiện kết nối WS (Thiếu user, user.id hoặc token)");
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

            // Nếu có lỗi debug, client sẽ in ra đây
            // debug: (str) => {
            //     console.log('STOMP Debug:', str);
            // },

            onConnect: () => {
                console.log("Đã kết nối STOMP thành công!");

                // Đăng ký nhận message. Chú ý phải dùng đúng ID của user
                const channel = `/topic/notification/${user.id}`;
                console.log("Đang Subscribe vào channel:", channel);

                client.subscribe(channel, (message) => {
                    console.log("Có tin nhắn mới từ WS:", message.body);
                    const newNotif = JSON.parse(message.body);

                    setNotifications((prev) => [newNotif, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                });
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
            client.deactivate();
        };
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            await seenNotification(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, seen: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Đã xóa thông báo");
        } catch (error) {
            toast.error("Không thể xóa thông báo");
        }
    };

    return {
        notifications,
        unreadCount,
        pageInfo,
        isLoading,
        fetchNotifications,
        handleMarkAsRead,
        handleDelete,
        fetchUnreadCount
    };
};