import { QAWebSocketContext } from "@/context/QAWebSocketContext";
import { useContext, useEffect } from "react";

export const useQAEventSession = (eventSessionId, onMessageReceived) => {
    const { stompClient, isConnected } = useContext(QAWebSocketContext);

    useEffect(() => {
        if (isConnected && stompClient && eventSessionId) {
            const topic = `/topic/question/event-session/${eventSessionId}`;
            console.log("Đang Subscribe vào channel Q&A:", topic);

            const subscription = stompClient.subscribe(topic, (message) => {
                if (message.body) {
                    const parsedData = JSON.parse(message.body);
                    onMessageReceived(parsedData);
                }
            });

            return () => {
                console.log("Hủy subscribe channel Q&A:", topic);
                subscription.unsubscribe();
            };
        }
    }, [stompClient, isConnected, eventSessionId, onMessageReceived]);

    return { isConnected };
};