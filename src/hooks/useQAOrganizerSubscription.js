import { QAWebSocketContext } from "@/context/QAWebSocketContext";
import { useContext, useEffect } from "react";

export const useQAOrganizerSubscription = (userId, onMessageReceived) => {
    const { stompClient, isConnected } = useContext(QAWebSocketContext);

    useEffect(() => {
        if (isConnected && stompClient && userId) {
            const topic = `/topic/question/organizer/${userId}`;
            console.log("Đang Subscribe vào channel Q&A Organizer:", topic);

            const subscription = stompClient.subscribe(topic, (message) => {
                if (message.body) {
                    const parsedData = JSON.parse(message.body);
                    onMessageReceived(parsedData);
                }
            });

            return () => {
                console.log("Hủy subscribe channel Q&A Organizer:", topic);
                subscription.unsubscribe();
            };
        }
    }, [stompClient, isConnected, userId, onMessageReceived]);

    return { isConnected };
};