import { QAWebSocketContext } from "@/context/QAWebSocketContext";
import { useContext, useEffect } from "react";

export const useQAOwnerSubscription = (onMessageReceived) => {
    const { stompClient, isConnected } = useContext(QAWebSocketContext);

    useEffect(() => {
        if (isConnected && stompClient) {
            const topic = `/user/queue/question`;
            console.log("Đang Subscribe vào channel Q&A Owner:", topic);

            const subscription = stompClient.subscribe(topic, (message) => {
                if (message.body) {
                    const parsedData = JSON.parse(message.body);
                    onMessageReceived(parsedData);
                }
            });

            return () => {
                console.log("Hủy subscribe channel Q&A Owner:", topic);
                subscription.unsubscribe();
            };
        }
    }, [stompClient, isConnected, onMessageReceived]);

    return { isConnected };
};