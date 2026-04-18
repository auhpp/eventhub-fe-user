import React, { useState } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { MessageStatus, MessageType } from '@/utils/constant';
import DefaultAvatar from '@/components/DefaultAvatar';

const MessageBubble = ({ message, isMe, otherUser, showStatus }) => {
    const [showTime, setShowTime] = useState(false);

    const isImage = message.type === MessageType.IMAGE || (message.pathUrl && message.pathUrl !== '');

    // Format time
    const timeString = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                {!isMe && (
                    <Avatar className="w-8 h-8 mb-1 flex-shrink-0">
                        <DefaultAvatar user={otherUser} />
                    </Avatar>
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                        onClick={() => setShowTime(!showTime)}
                        className={`cursor-pointer relative px-4 py-2 text-[15px] shadow-sm transition-colors ${isImage
                            ? 'bg-transparent p-0 shadow-none'
                            : isMe
                                ? 'bg-brand text-white rounded-2xl rounded-br-sm hover:bg-brand/90' 
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {isImage ? (
                            <img
                                src={message.pathUrl}
                                alt="attachment"
                                className="max-w-[240px] md:max-w-xs rounded-2xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                            />
                        ) : (
                            <p className="whitespace-pre-wrap break-words leading-relaxed select-none">
                                {message.content}
                            </p>
                        )}
                    </div>

                    {/* just show status when needed */}
                    {(showTime || (isMe && showStatus)) && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 
                        px-1 animate-in fade-in slide-in-from-top-1 duration-200">

                            {showTime && <span>{timeString}</span>}

                            {showTime && isMe && showStatus && <span>•</span>}

                            {/* display status if this is the last message */}
                            {isMe && showStatus && (
                                <>
                                    {message.status === MessageStatus.SEEN && <span>Đã xem</span>}
                                    {message.status === MessageStatus.RECEIVED && <span>Đã nhận</span>}
                                    {message.status === MessageStatus.SENT && <span>Đã gửi</span>}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;