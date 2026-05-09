import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2, FileText, Trash2, CloudOff, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createUserNote } from '@/services/userNoteService';

const QuestionNote = ({ questionId, isVisible }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [lastSavedTime, setLastSavedTime] = useState(null);

    // Audio States
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    // restore draft note iwhen component errors
    useEffect(() => {
        const draft = localStorage.getItem(`draft_note_${questionId}`);
        if (draft) setNoteContent(draft);
    }, [questionId]);

    // handle recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());

            };

            mediaRecorder.start();
            setIsRecording(true);

            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Lỗi truy cập micro:', error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                toast.error('Vui lòng cho phép truy cập Micro trong cài đặt trình duyệt để sử dụng tính năng này');
            } else {
                toast.error('Không tìm thấy thiết bị thu âm hoặc có lỗi xảy ra.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim() && !audioBlob) {
            toast.warning("Vui lòng nhập nội dung hoặc ghi âm trước khi lưu.");
            return;
        }

        if (!navigator.onLine) {
            localStorage.setItem(`draft_note_${questionId}`, noteContent);
            toast.error("Không có mạng. Ghi chú đã được lưu tạm trên máy.", { icon: <CloudOff className="w-4 h-4" /> });
            return;
        }

        try {
            setIsUploading(true);
            const formDataPayload = {
                questionId: questionId,
                noteContent: noteContent.trim(),
            };

            if (audioBlob) {
                const audioFile = new File([audioBlob], `note-audio-${questionId}.webm`, { type: 'audio/webm' });
                formDataPayload.audioFile = audioFile;
            }

            await createUserNote(formDataPayload);

            toast.success('Đã lưu ghi chú thành công');
            localStorage.removeItem(`draft_note_${questionId}`);
            setLastSavedTime(new Date());

            setNoteContent('');
            setAudioBlob(null);
            setAudioUrl(null);

        } catch (error) {
            console.error("Lỗi upload ghi chú:", error);
            toast.error("Không thể lưu lên hệ thống. Vui lòng thử lại sau.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAudioLocal = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    if (!isVisible) return null;

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                    <FileText className="w-4 h-4" />
                    Thêm Ghi chú cá nhân & Ghi âm
                </button>
            ) : (
                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 relative">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                            Ghi chú của bạn (Chỉ mình bạn xem)
                        </span>
                        <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                            Đóng
                        </button>
                    </div>

                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Tóm tắt ý chính mà diễn giả đang trả lời..."
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-h-[80px] resize-none mb-3"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    disabled={isUploading}
                                    className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    <Mic className="w-4 h-4" />
                                    Thu âm diễn giả
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium animate-pulse hover:bg-red-700"
                                >
                                    <Square className="w-4 h-4 fill-white" />
                                    Dừng ({formatTime(recordingTime)})
                                </button>
                            )}

                            {audioUrl && !isRecording && (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                                    <audio src={audioUrl} controls className="h-6 w-32 md:w-48" />
                                    <button
                                        onClick={handleDeleteAudioLocal}
                                        className="text-slate-400 hover:text-red-500"
                                        title="Xóa đoạn thu âm này"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {lastSavedTime && !isUploading && (
                                <span className="text-xs text-slate-500 flex items-center gap-1 mr-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    Đã lưu {lastSavedTime.toLocaleTimeString()}
                                </span>
                            )}

                            <button
                                onClick={handleSaveNote} 
                                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Lưu ghi chú
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionNote;