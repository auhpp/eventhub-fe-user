import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Trash2, Clock, RotateCcw, Shield } from "lucide-react";

import { changeAccessImage } from "@/services/eventService";
import { getEventImages, uploadEventImages, refreshProcessImages, deleteEventImage } from "@/services/eventImageService";
import UploadZone from "@/features/eventImage/UploadZone";
import ImageCard from "@/features/eventImage/ImageCard";
import FilePreviewList from "@/features/eventImage/FilePreviewList";
import DefaultPagination from "@/components/DefaultPagination";
import { EventContext } from "@/context/EventContext";
import { isExpiredEventSession } from "@/utils/eventUtils";
import SessionSelector from "@/components/SessionSelector";

export const ACCESS_IMAGE_OPTIONS = {
    PUBLIC: "Công khai",
    ATTENDEE: "Người tham gia",
    PRIVATE: "Riêng tư"
};

const EventGalleryPage = () => {
    const { id } = useParams();
    const { event } = useContext(EventContext);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const selectedSessionId = searchParams.get("sessionId") || "";

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [queuedFiles, setQueuedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [uploadProgress, setUploadProgress] = useState({ currentBatch: 0, totalBatches: 0 });

    const [isRefreshingFailed, setIsRefreshingFailed] = useState(false);

    const [filterStatus, setFilterStatus] = useState("ALL");
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [accessImage, setAccessImage] = useState("PUBLIC");
    const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

    useEffect(() => {
        if (event?.accessImage) {
            setAccessImage(event.accessImage);
        }
    }, [event?.accessImage]);

    const handleUpdateAccessImage = async (newAccess) => {
        if (!event?.id) return;

        setIsUpdatingAccess(true);
        const previousAccess = accessImage;
        setAccessImage(newAccess);

        try {
            await changeAccessImage({ eventId: event.id, accessImage: newAccess });
            toast.success("Đã cập nhật quyền xem ảnh sự kiện!");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi cập nhật quyền xem ảnh.");
            setAccessImage(previousAccess);
        } finally {
            setIsUpdatingAccess(false);
        }
    };

    useEffect(() => {
        if (event?.eventSessions?.length > 0 && !selectedSessionId) {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                newParams.set("sessionId", event.eventSessions[0].id);
                return newParams;
            }, { replace: true });
        }
    }, [event, selectedSessionId, setSearchParams]);

    const fetchImages = useCallback(async (isBackground = false) => {
        if (!id || !selectedSessionId) return;
        if (!isBackground) setLoading(true);

        try {
            const data = await getEventImages({
                eventSessionId: selectedSessionId,
                page: currentPage,
                size: pageSize,
                status: filterStatus
            });
            setImages(data.result.data || []);
            setTotalPages(data.result.totalPage || 1);
            setTotalElements(data.result.totalElements || 1);
        } catch (error) {
            console.log(error);
            if (!isBackground) toast.error("Không thể tải danh sách ảnh");
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [id, selectedSessionId, currentPage, filterStatus]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchImages(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchImages]);

    const handleDeleteImage = async (imageId) => {
        try {
            await deleteEventImage({ imageId });
            toast.success("Đã xóa ảnh thành công!");

            if (images.length === 1 && currentPage > 1) {
                setSearchParams((prev) => {
                    const newParams = new URLSearchParams(prev);
                    newParams.set("page", (currentPage - 1).toString());
                    return newParams;
                });
            } else {
                fetchImages();
            }
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi xóa ảnh.");
        }
    };

    const handleRefreshFailedImages = async () => {
        if (!id || !selectedSessionId) return;
        setIsRefreshingFailed(true);
        try {
            await refreshProcessImages({ eventSessionId: selectedSessionId });
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

    const handleSubmitUpload = async () => {
        if (queuedFiles.length === 0 || !selectedSessionId) return;

        setUploading(true);

        const BATCH_SIZE = 5;
        const totalBatches = Math.ceil(queuedFiles.length / BATCH_SIZE);

        setUploadProgress({ currentBatch: 0, totalBatches });

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < totalBatches; i++) {
            const start = i * BATCH_SIZE;
            const end = start + BATCH_SIZE;
            const chunk = queuedFiles.slice(start, end);

            setUploadProgress({ currentBatch: i + 1, totalBatches });

            try {
                await uploadEventImages(selectedSessionId, chunk);
                successCount += chunk.length;
            } catch (error) {
                console.error(`Lỗi khi tải lên nhóm ${i + 1}:`, error);
                errorCount += chunk.length;
            }
        }

        setUploading(false);
        setUploadProgress({ currentBatch: 0, totalBatches: 0 });
        setQueuedFiles([]); 

        if (errorCount === 0) {
            toast.success(`Đã tải lên thành công toàn bộ ${successCount} ảnh!`);
        } else {
            toast.warning(`Tải lên hoàn tất. Thành công: ${successCount}, Lỗi: ${errorCount}.`);
        }

        setFilterStatus("ALL");
        fetchImages();
    };

    const handleFileSelect = (files) => {
        const newFiles = Array.from(files);
        const existingFileKeys = new Set(queuedFiles.map(f => `${f.name}-${f.size}`));
        const uniqueNewFiles = newFiles.filter(file => {
            const fileKey = `${file.name}-${file.size}`;
            if (existingFileKeys.has(fileKey)) return false;
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

    const handleSessionChange = (newSessionId) => {
        setQueuedFiles([]);

        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("sessionId", newSessionId);
            newParams.set("page", "1");
            return newParams;
        });
    };



    const isCurrentSessionExpired = useMemo(() => {
        if (!event?.eventSessions || !selectedSessionId) return false;
        const currentSession = event.eventSessions.find(es => String(es.id) === String(selectedSessionId));
        return currentSession ? isExpiredEventSession({ endDateTime: currentSession.endDateTime }) : false;
    }, [event, selectedSessionId]);

    const pageSize = 12;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Ảnh sự kiện</h1>
                    <p className="text-muted-foreground text-sm">
                        Quản lý và theo dõi trạng thái xử lý AI của ảnh sự kiện theo từng khung giờ.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Quyền xem ảnh:</span>
                    <Select value={accessImage} onValueChange={handleUpdateAccessImage} disabled={isUpdatingAccess}>
                        <SelectTrigger className="w-[200px] h-8 bg-background">
                            <SelectValue placeholder="Chọn quyền..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(ACCESS_IMAGE_OPTIONS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <SessionSelector
                sessions={event?.eventSessions || []}
                selectedSessionId={selectedSessionId}
                onSelect={handleSessionChange}
            />

            <div className="grid gap-6 border rounded-lg p-6 bg-background/50">
                {!isCurrentSessionExpired ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Chưa thể tải ảnh lên</h3>
                            <p className="text-muted-foreground max-w-md mt-1">
                                Tính năng tải ảnh chỉ khả dụng sau khi khung giờ sự kiện này kết thúc. Vui lòng quay lại sau!
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
                                        <Button variant="ghost" size="sm" onClick={handleClearQueue} disabled={uploading} className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4 mr-2" /> Hủy bỏ
                                        </Button>

                                        <Button onClick={handleSubmitUpload} disabled={uploading}>
                                            {uploading ? (
                                                <>Đang tải lên {uploadProgress.currentBatch}/{uploadProgress.totalBatches}...</>
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

            {/* Gallery Grid */}
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
                                <ImageCard
                                    key={img.id}
                                    image={img}
                                    showStatus={true}
                                    onDelete={handleDeleteImage}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-lg">
                            <p className="text-muted-foreground">Chưa có ảnh nào được tải lên hoặc khớp với bộ lọc.</p>
                        </div>
                    )
                }
            </div>

            {/* Pagination */}
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