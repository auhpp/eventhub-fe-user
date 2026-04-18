import { useChatWebSocket } from '@/hooks/useChatWebsocket';
import React, { createContext, useContext } from 'react';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const chatWS = useChatWebSocket();

    return (
        <ChatContext.Provider value={chatWS}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
};