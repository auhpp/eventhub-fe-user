import React, { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronUp, Clock, Trash2, Headphones, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { deleteUserNote, filterUserNotes } from '@/services/userNoteService';

const QuestionNoteList = ({ questionId, userId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (isExpanded && !hasFetched) {
            fetchNotes();
        }
    }, [isExpanded, hasFetched, questionId, userId]);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const res = await filterUserNotes({
                questionId,
                userId,
                page: 1,
                size: 50 
            });

            const fetchedNotes = res.result?.data || [];
            setNotes(fetchedNotes);
            setHasFetched(true);
        } catch (error) {
            console.error("Lỗi tải ghi chú:", error);
            toast.error("Không thể tải danh sách ghi chú.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) return;

        try {
            // Optimistic update
            setNotes(prev => prev.filter(note => note.id !== noteId));

            await deleteUserNote(noteId);
            toast.success("Đã xóa ghi chú.");
        } catch (error) {
            console.error("Lỗi xóa ghi chú:", error);
            toast.error("Không thể xóa ghi chú. Vui lòng thử lại!");
            fetchNotes();
        }
    };

    return (
        <div className="mt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {isExpanded ? "Ẩn ghi chú đã lưu" : "Xem các ghi chú đã lưu của bạn"}
            </button>


            {/* area for rendering notes */}
            {isExpanded && (
                <div className="mt-3 space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4 text-center text-sm text-slate-500">
                            Bạn chưa có ghi chú nào cho câu hỏi này.
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-blue-200 transition-colors group relative"
                            >
                                {/* Header of Note */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        {format(new Date(note.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Xóa ghi chú"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* content Text */}
                                {note.noteContent && (
                                    <div className="flex gap-2 items-start mb-2">
                                        <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {note.noteContent}
                                        </p>
                                    </div>
                                )}

                                {/* Audio Player */}
                                {note.audioUrl && (
                                    <div className="flex gap-2 items-center mt-3 bg-slate-50 p-2 rounded-md border border-slate-100">
                                        <Headphones className="w-4 h-4 text-blue-500 shrink-0" />
                                        <audio
                                            src={note.audioUrl}
                                            controls
                                            className="h-8 w-full outline-none"
                                            controlsList="nodownload noplaybackrate"
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionNoteList;