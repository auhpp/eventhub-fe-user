import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from './StarRating';
import { createReview, updateReview } from '@/services/reviewService';

const ReviewFormDialog = ({ isOpen, onClose, eventSessionId, attendeeId, onSuccess, initialData = null }) => {
    const isEditMode = !!initialData;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    // State for images
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    // State for edit images
    const [existingImages, setExistingImages] = useState([]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setRating(initialData.rating);
                setComment(initialData.comment || "");
                setExistingImages(initialData.reviewImages || []);
            } else {
                setRating(0);
                setComment("");
                setExistingImages([]);
            }
            setFiles([]);
            setPreviews([]);
            setDeleteImageIds([]);
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        return () => previews.forEach(p => URL.revokeObjectURL(p));
    }, [previews]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const totalImages = existingImages.length + files.length + selectedFiles.length;

        if (totalImages > 5) {
            toast.error("Tổng số ảnh (cũ và mới) không được vượt quá 5.");
            return;
        }

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setFiles(prev => [...prev, ...selectedFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemoveNewFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleRemoveExistingImage = (imageId) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setDeleteImageIds(prev => [...prev, imageId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating < 1) {
            toast.error("Vui lòng chọn số sao đánh giá.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (comment) formData.append("comment", comment);
            formData.append("rating", rating);
            files.forEach(file => formData.append("files", file));

            if (isEditMode) {
                deleteImageIds.forEach(id => formData.append("deleteImageIds", id));
                await updateReview(initialData.id, formData);
                toast.success("Cập nhật đánh giá thành công!");
            } else {
                formData.append("eventSessionId", eventSessionId);
                formData.append("attendeeId", attendeeId);
                await createReview(formData);
                toast.success("Cảm ơn bạn đã đánh giá sự kiện!");
            }

            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu đánh giá.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Sửa đánh giá" : "Đánh giá sự kiện"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Bạn có thể chỉnh sửa nội dung và hình ảnh (tối đa 5 ảnh)."
                            : "Chia sẻ trải nghiệm của bạn về sự kiện này. Tối đa 5 hình ảnh."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label className="text-base font-semibold">Chất lượng sự kiện</Label>
                        <StarRating rating={rating} setRating={setRating} size="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Nhận xét của bạn</Label>
                        <Textarea
                            id="comment"
                            placeholder="Sự kiện tổ chức rất tuyệt vời..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Hình ảnh đính kèm ({existingImages.length + files.length}/5)</Label>
                        <div className="flex flex-wrap gap-3">
                            {/* Render old images */}
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative w-20 h-20 group">
                                    <img src={img.imageUrl} alt="Existing" className="w-full h-full object-cover
                                     rounded-md border border-slate-200" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(img.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                        opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Render new images preview */}
                            {previews.map((preview, index) => (
                                <div key={`new-${index}`} className="relative w-20 h-20 group">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-md 
                                    border border-slate-200" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewFile(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                                         opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* button add image */}
                            {(existingImages.length + files.length) < 5 && (
                                <Label className="w-20 h-20 flex flex-col items-center justify-center border-2 
                                border-dashed border-slate-300 rounded-md cursor-pointer hover:border-primary
                                 hover:bg-slate-50 transition-colors">
                                    <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                                    <span className="text-[10px] text-slate-500 font-medium">Thêm ảnh</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                </Label>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white">
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEditMode ? "Lưu thay đổi" : "Gửi đánh giá"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewFormDialog;