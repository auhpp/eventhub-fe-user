import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MessageType } from '@/utils/constant';

const ChatInput = ({ onSendMessage, conversationId }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = (e) => {
        e?.preventDefault();
        if (!text.trim() && !file) return;

        const formData = new FormData();
        if (!String(conversationId).startsWith('temp_')) {
            formData.append('conversationId', conversationId);
        }

        formData.append('tempId', `temp_${Date.now()}`);

        if (file) {
            formData.append('file', file);
            formData.append('type', MessageType.IMAGE);
            if (text.trim()) formData.append('content', text);
        } else {
            formData.append('content', text);
            formData.append('type', MessageType.TEXT);
        }

        onSendMessage(formData, preview);
        // Reset UI
        setText('');
        handleRemoveFile();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 border-t px-4 py-3 flex-shrink-0">
            {preview && (
                <div className="relative inline-block mb-3 ml-12">
                    <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                    <button
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="flex items-end gap-2">
                <div className="flex gap-1 text-gray-500 pb-1.5">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-100 hover:text-brand transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center px-4 min-h-[44px]">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none py-3 text-[15px] resize-none max-h-32 custom-scrollbar"
                        style={{ height: "auto" }}
                    />
                
                </div>

                <Button
                    type="submit"
                    disabled={!text.trim() && !file}
                    className={`flex items-center justify-center rounded-full w-12 h-12 p-0 shrink-0 mb-0.5 transition-all duration-200 ${(!text.trim() && !file)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                        : 'bg-brand text-white hover:bg-brand/90 shadow-md hover:shadow-lg'
                        }`}
                >
                    <Send className="w-5 h-5 ml-1" />
                </Button>
            </form>
        </div>
    );
};

export default ChatInput;