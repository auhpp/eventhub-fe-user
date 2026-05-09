import DefaultPagination from "@/components/DefaultPagination";
import ImageCard from "@/features/eventImage/ImageCard";
import { getEventImages, searchPhotos } from "@/services/eventImageService"; 
import { ImageIcon, Lock, Loader2, X, Frown } from "lucide-react"; 
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SessionSelector from "@/components/SessionSelector";
import { checkAttendance } from "@/services/attendeeService";
import FaceSearch from "./FaceSearch"; 
import { set } from "date-fns";
import { Button } from "@/components/ui/button";

const PublicEventGallery = ({ eventId, accessImage, currentUser, eventSessions = [], showFaceSearch }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [canView, setCanView] = useState(false);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [accessMessage, setAccessMessage] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const selectedSessionId = searchParams.get("sessionId") || "";

    const pageSize = 15;
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // --- STATE CHO FACE SEARCH ---
    const [faceSearchResults, setFaceSearchResults] = useState(null);
    const [isSearchingFace, setIsSearchingFace] = useState(false);
    const [facePreviewUrl, setFacePreviewUrl] = useState(null);

    useEffect(() => {
        const verifyAccess = async () => {
            setIsCheckingAccess(true);
            if (!accessImage || accessImage === "PUBLIC") {
                setCanView(true); setIsCheckingAccess(false); return;
            }
            if (accessImage === "PRIVATE") {
                setCanView(false); setAccessMessage("Bộ sưu tập ảnh này được đặt ở chế độ Riêng tư."); setIsCheckingAccess(false); return;
            }
            if (accessImage === "ATTENDEE") {
                if (!currentUser) {
                    setCanView(false); setAccessMessage("Bạn cần đăng nhập và là người tham gia sự kiện để xem bộ sưu tập này."); setIsCheckingAccess(false); return;
                }
                try {
                    const response = await checkAttendance({ eventId });
                    if (response.result) { setCanView(true); }
                    else { setCanView(false); setAccessMessage("Chỉ những khách mời đã tham gia sự kiện mới có quyền xem ảnh."); }
                    // eslint-disable-next-line no-unused-vars
                } catch (error) {
                    setCanView(false); setAccessMessage("Có lỗi xảy ra khi kiểm tra quyền truy cập.");
                } finally {
                    setIsCheckingAccess(false);
                }
            }
        };
        if (eventId) verifyAccess();
    }, [accessImage, eventId, currentUser]);

    useEffect(() => {
        if (canView && eventSessions?.length > 0 && !selectedSessionId) {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                newParams.set("sessionId", eventSessions[0].id);
                return newParams;
            }, { replace: true });
        }
    }, [eventSessions, selectedSessionId, setSearchParams, canView]);

    const fetchImages = useCallback(async () => {
        if (!selectedSessionId || !canView) return;
        setLoading(true);
        try {
            const data = await getEventImages({
                eventSessionId: selectedSessionId,
                page: currentPage,
                size: pageSize,
                status: "COMPLETED"
            });
            setImages(data.result.data || []);
            setTotalPages(data.result.totalPage || 1);
            setTotalElements(data.result.totalElements || 0);
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedSessionId, currentPage, canView]);

    useEffect(() => {
        if (!faceSearchResults && !isSearchingFace) {
            fetchImages();
        }
    }, [fetchImages, faceSearchResults, isSearchingFace]);

    const handleSessionChange = (newSessionId) => {
        handleClearFaceSearch(); 
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("sessionId", newSessionId);
            newParams.set("page", "1");
            return newParams;
        });
    };


    const handleStartFaceSearch = async (file, previewUrl) => {
        if (!selectedSessionId) return;
        setFacePreviewUrl(previewUrl);
        setIsSearchingFace(true);
        setFaceSearchResults(null);
        try {
            const response = await searchPhotos({ eventSessionId: selectedSessionId, file });
            setFaceSearchResults(response.result || []);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm ảnh AI:", error);
            setFaceSearchResults([]);
        } finally {
            setIsSearchingFace(false);
        }
    };

    const handleClearFaceSearch = () => {
        setFaceSearchResults(null);
        setFacePreviewUrl(null);
        setIsSearchingFace(false);
    };

    if (isCheckingAccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed mt-6 text-center px-4">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Không có quyền truy cập</h3>
                <p className="text-muted-foreground max-w-md">{accessMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Danh sách ảnh sự kiện
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Xem lại những hình ảnh đáng nhớ và tìm kiếm ảnh của bạn bằng công nghệ AI.
                    </p>
                </div>

                {showFaceSearch && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <FaceSearch onSearch={handleStartFaceSearch} isSearching={isSearchingFace} />
                    </div>
                )}
            </div>

            <SessionSelector
                sessions={eventSessions}
                selectedSessionId={selectedSessionId}
                onSelect={handleSessionChange}
            />

            {isSearchingFace ? (
                <div className="flex flex-col items-center gap-6 py-16 animate-in fade-in">
                    <div className="relative">
                        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                        <img src={facePreviewUrl} className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 relative z-10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            AI đang quét khuôn mặt...
                        </h3>
                        <p className="text-sm text-gray-500 animate-pulse">Đang đối chiếu với hàng ngàn bức ảnh tại sự kiện</p>
                    </div>
                </div>
            ) : faceSearchResults !== null ? (
                faceSearchResults.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4">

                        <div className="flex flex-col sm:flex-row items-center gap-5 
                        bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2 rounded-lg mb-6 mt-2">
                            <img
                                src={facePreviewUrl}
                                alt="Face filter"
                                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm"
                            />
                            <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    Kết quả lọc theo khuôn mặt
                                </h4>
                                <p className="text-blue-700 dark:text-blue-300 mt-1">
                                    Tìm thấy <span className="font-bold text-lg">{faceSearchResults.length}</span> bức ảnh khớp với bạn.
                                </p>
                            </div>
                            <Button
                                onClick={handleClearFaceSearch}
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2 w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                <X className="w-5 h-5" />
                                Hủy lọc ảnh
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {faceSearchResults.map((img) => (
                                <ImageCard key={img.id} image={img} showStatus={false} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed mt-6 px-4 animate-in fade-in">
                        <div className="relative mb-6 inline-block opacity-60 grayscale hover:grayscale-0 transition-all">
                            <img src={facePreviewUrl} className="w-28 h-28 object-cover rounded-2xl shadow-sm border border-gray-200" />
                            <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-2 shadow-md">
                                <Frown className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Không tìm thấy khoảnh khắc nào</h4>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            AI không phát hiện thấy khuôn mặt này trong thư viện ảnh. Bạn hãy thử chụp một bức selfie thẳng mặt và đủ sáng hơn nhé.
                        </p>
                        <Button onClick={handleClearFaceSearch} variant="outline" className="mt-6 gap-2">
                            <X className="w-4 h-4" /> Xem tất cả ảnh
                        </Button>
                    </div>
                )
            ) : (
                <>
                    {loading && images.length === 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : images.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 animate-in fade-in">
                                {images.map((img) => (
                                    <ImageCard key={img.id} image={img} showStatus={false} />
                                ))}
                            </div>
                            <div className="mt-8">
                                <DefaultPagination
                                    currentPage={currentPage}
                                    setSearchParams={set}
                                    totalPages={totalPages}
                                    totalElements={totalElements}
                                    pageSize={pageSize}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed mt-6">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa có ảnh nào</h3>
                            <p className="text-gray-500">Hình ảnh của khung giờ này sẽ sớm được cập nhật tại đây.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PublicEventGallery;