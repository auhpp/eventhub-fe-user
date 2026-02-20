import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Trash2 } from "lucide-react";

import { getEventImages, uploadEventImages } from "@/services/eventImageService";
import UploadZone from "@/features/eventImage/UploadZone";
import ImageCard from "@/features/eventImage/ImageCard";
import FilePreviewList from "@/features/eventImage/FilePreviewList";
import DefaultPagination from "@/components/DefaultPagination";

const EventGalleryPage = () => {
    const { id } = useParams();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [queuedFiles, setQueuedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Filter & Pagination State
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;

    // Fetch Data 
    const fetchImages = useCallback(async (isBackground = false) => {
        if (!id) return;
        if (!isBackground) setLoading(true);

        try {
            const data = await getEventImages({ eventId: id, page: currentPage, size: pageSize, status: filterStatus });
            setImages(data.result.data || []);
            setTotalPages(data.result.totalPage || 1);
            setTotalElements(data.result.totalElements || 1);

        } catch (error) {
            console.log(error);
            if (!isBackground) toast.error("Không thể tải danh sách ảnh");
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [id, currentPage, filterStatus]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchImages(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchImages]);

    // 3. New Handlers for Queue Logic

    // Handler 1: add to queue
    const handleFileSelect = (files) => {
        const newFiles = Array.from(files);

        const existingFileKeys = new Set(queuedFiles.map(f => `${f.name}-${f.size}`));

        const uniqueNewFiles = newFiles.filter(file => {
            const fileKey = `${file.name}-${file.size}`;

            if (existingFileKeys.has(fileKey)) {
                return false;
            }

            existingFileKeys.add(fileKey);
            return true;
        });

        if (uniqueNewFiles.length === 0) {
            toast.warning("Các ảnh được chọn đều đã có trong hàng đợi.");
            return;
        }

        setQueuedFiles((prev) => [...prev, ...uniqueNewFiles]);

        toast.info(`Đã thêm ${uniqueNewFiles.length} ảnh vào hàng đợi.`);

        if (newFiles.length > uniqueNewFiles.length) {
            toast.warning(`Đã bỏ qua ${newFiles.length - uniqueNewFiles.length} ảnh trùng lặp.`);
        }
    };

    // Handler 2: remove to queue
    const handleRemoveFile = (indexToRemove) => {
        setQueuedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    // Handler 3: clear queue
    const handleClearQueue = () => {
        setQueuedFiles([]);
    };

    // Handler 4: SUBMIT 
    const handleSubmitUpload = async () => {
        if (queuedFiles.length === 0) return;

        setUploading(true);
        try {
            await uploadEventImages(id, queuedFiles);

            toast.success(`Đã tải lên thành công ${queuedFiles.length} ảnh!`);

            // Reset and reload list image
            setQueuedFiles([]);
            setFilterStatus("ALL");
            fetchImages();
        } catch (error) {
            toast.error("Lỗi khi tải ảnh lên server.");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Thư viện ảnh sự kiện</h1>
                    <p className="text-muted-foreground text-sm">
                        Quản lý và theo dõi trạng thái xử lý AI của ảnh sự kiện.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Lọc theo trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả ảnh</SelectItem>
                            <SelectItem value="COMPLETED">Đã hoàn tất</SelectItem>
                            <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                            <SelectItem value="FAILED">Lỗi</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={() => fetchImages(false)} title="Làm mới">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            {/* --- Upload Area --- */}
            <div className="grid gap-6 border rounded-lg p-6 bg-background/50">
                {/* 1. Dropzone */}
                {!uploading && (
                    <UploadZone onUpload={handleFileSelect} isUploading={false} />
                )}

                {/* 2. Preview & Action Buttons */}
                {queuedFiles.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold">Hàng đợi tải lên ({queuedFiles.length} files)</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={handleClearQueue} disabled={uploading} className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Hủy bỏ
                                </Button>
                                <Button onClick={handleSubmitUpload} disabled={uploading}>
                                    {uploading ? (
                                        <>Loading...</>
                                    ) : (
                                        <><Upload className="w-4 h-4 mr-2" /> Xác nhận tải lên server</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* List Component */}
                        <div className="max-h-[300px] overflow-y-auto pr-2">
                            <FilePreviewList files={queuedFiles} onRemove={handleRemoveFile} />
                        </div>
                    </div>
                )}
            </div>

            {/* --- Gallery Grid --- */}
            <div className="space-y-4 mt-8">
                <h2 className="text-lg font-semibold">Danh sách ảnh trên server</h2>
                {loading && images.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {images.map((img) => (
                            <ImageCard key={img.id} image={img} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground">Chưa có ảnh nào được tải lên.</p>
                    </div>
                )}
            </div>

            {/* --- Pagination --- */}
            {images.length > 0 && (
                <DefaultPagination
                    currentPage={currentPage}
                    setSearchParams={setSearchParams}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                />

            )}
        </div>
    );
};

export default EventGalleryPage;