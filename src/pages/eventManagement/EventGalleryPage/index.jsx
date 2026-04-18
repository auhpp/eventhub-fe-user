import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Trash2, Clock, RotateCcw } from "lucide-react"; 

import { getEventImages, uploadEventImages, refreshProcessImages } from "@/services/eventImageService";
import UploadZone from "@/features/eventImage/UploadZone";
import ImageCard from "@/features/eventImage/ImageCard";
import FilePreviewList from "@/features/eventImage/FilePreviewList";
import DefaultPagination from "@/components/DefaultPagination";
import { EventContext } from "@/context/EventContext";
import { isExpiredEventSession } from "@/utils/eventUtils";

const EventGalleryPage = () => {
    const { id } = useParams();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { event } = useContext(EventContext)
    const [queuedFiles, setQueuedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [isRefreshingFailed, setIsRefreshingFailed] = useState(false);

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


    // Handler
    const handleRefreshFailedImages = async () => {
        if (!id) return;
        setIsRefreshingFailed(true);
        try {
            await refreshProcessImages({ eventId: id });
            toast.success("Đã gửi yêu cầu xử lý lại các ảnh lỗi thành công!");

            setFilterStatus("ALL");
            fetchImages();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi yêu cầu xử lý lại ảnh.");
        } finally {
            setIsRefreshingFailed(false);
        }
    };


    // 3. Handlers for Queue Logic
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

    const handleRemoveFile = (indexToRemove) => {
        setQueuedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleClearQueue = () => {
        setQueuedFiles([]);
    };

    const handleSubmitUpload = async () => {
        if (queuedFiles.length === 0) return;

        setUploading(true);
        try {
            await uploadEventImages(id, queuedFiles);
            toast.success(`Đã tải lên thành công ${queuedFiles.length} ảnh!`);
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

    const someEventSessionExpired = event.eventSessions.some(es => isExpiredEventSession({ endDateTime: es.endDateTime }));

    return (
        <div className="space-y-6 pb-10">
            {/* --- Header --- */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Ảnh sự kiện</h1>
                <p className="text-muted-foreground text-sm">
                    Quản lý và theo dõi trạng thái xử lý AI của ảnh sự kiện.
                </p>
            </div>

            {/* --- Upload Area --- */}
            <div className="grid gap-6 border rounded-lg p-6 bg-background/50">
                {!someEventSessionExpired ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Chưa thể tải ảnh lên</h3>
                            <p className="text-muted-foreground max-w-md mt-1">
                                Tính năng tải ảnh chỉ khả dụng sau khi sự kiện có ít nhất một khung giờ đã kết thúc.
                                 Vui lòng quay lại sau!
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {!uploading && (
                            <UploadZone onUpload={handleFileSelect} isUploading={false} />
                        )}

                        {queuedFiles.length > 0 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold">Hàng đợi tải lên ({queuedFiles.length} files)</h3>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={handleClearQueue} disabled={uploading}
                                         className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4 mr-2" /> Hủy bỏ
                                        </Button>
                                        <Button onClick={handleSubmitUpload} disabled={uploading}>
                                            {uploading ? (
                                                <>Đang tải lên...</>
                                            ) : (
                                                <><Upload className="w-4 h-4 mr-2" /> Xác nhận tải lên server</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto pr-2">
                                    <FilePreviewList files={queuedFiles} onRemove={handleRemoveFile} />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- Gallery Grid --- */}
            <div className="space-y-4 mt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-lg font-semibold">Danh sách ảnh trên server</h2>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleRefreshFailedImages}
                            disabled={isRefreshingFailed}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                            <RotateCcw className={`h-4 w-4 mr-2 ${isRefreshingFailed ? "animate-spin" : ""}`} />
                            Xử lý lại ảnh lỗi
                        </Button>

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

                {
                    loading && images.length === 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((img) => (
                                <ImageCard key={img.id} image={img} showStatus={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-lg">
                            <p className="text-muted-foreground">Chưa có ảnh nào được tải lên hoặc khớp với bộ lọc.</p>
                        </div>
                    )
                }
            </div>

            {/* --- Pagination --- */}
            {
                images.length > 0 && (
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={setSearchParams}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                )
            }
        </div>
    );
};

export default EventGalleryPage;