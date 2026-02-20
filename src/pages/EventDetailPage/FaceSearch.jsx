import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, ScanFace, Loader2, Frown, Download, Maximize2 } from "lucide-react";
import { searchPhotos } from "@/services/eventImageService";

const FaceSearch = ({ eventId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
        }
    };

    const handleSearch = async () => {
        if (!selectedFile) return;
        setIsSearching(true);
        try {
            const response = await searchPhotos({ eventId: eventId, file: selectedFile })
            setResults(response.result);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm ảnh:", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            setTimeout(() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setResults(null);
                setIsSearching(false);
            }, 300);
        }
    };

    const handleDownload = async (e, imageUrl, imageId) => {
        e.stopPropagation();
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `event-${eventId}-photo-${imageId}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Lỗi khi tải ảnh, fallback sang mở tab mới:", error);
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto bg-primary text-white gap-2 h-14 text-lg px-8 rounded-lg shadow-lg hover:scale-105 transition-transform">
                    <ScanFace className="w-6 h-6" />
                    TÌM ẢNH CÓ MẶT BẠN
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Tìm kiếm khoảnh khắc của bạn
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Step 1: UPLOAD / PREVIEW */}
                    {!isSearching && !results && (
                        <div className="flex flex-col items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {!previewUrl ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                        <UploadCloud className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-medium">Nhấn để tải ảnh Selfie lên</p>
                                        <p className="text-sm text-gray-500">Hoặc mở Camera trên điện thoại</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full max-w-sm mx-auto">
                                    <img
                                        src={previewUrl}
                                        alt="Selfie Preview"
                                        className="w-full h-64 object-cover rounded-2xl shadow-md border"
                                    />
                                    <button
                                        onClick={() => setPreviewUrl(null)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black text-white rounded-full backdrop-blur-sm transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <div className="w-full flex justify-center mt-4">
                                <Button
                                    size="lg"
                                    disabled={!selectedFile}
                                    onClick={handleSearch}
                                    className="w-full sm:w-2/3 gap-2"
                                >
                                    <ScanFace className="w-5 h-5" />
                                    Bắt đầu tìm kiếm
                                </Button>
                            </div>
                            <p className="text-xs text-center text-gray-500">
                                * Ảnh của bạn chỉ được dùng để nhận diện và không bị lưu trữ lại.
                            </p>
                        </div>
                    )}

                    {/* Step 2: LOADING SKELETON */}
                    {isSearching && (
                        <div className="flex flex-col items-center gap-6 py-8">
                            <div className="relative">
                                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                                <img src={previewUrl} className="w-24 h-24 object-cover rounded-full border-4 border-blue-500 relative z-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                    AI đang quét khuôn mặt...
                                </h3>
                                <p className="text-sm text-gray-500 animate-pulse">Đang đối chiếu với hàng ngàn bức ảnh tại sự kiện</p>
                            </div>

                            <div className="w-full columns-2 md:columns-3 gap-4 space-y-4 mt-4 opacity-50">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse ${i % 2 === 0 ? 'h-40' : 'h-60'}`}></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: result */}
                    {!isSearching && results !== null && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl gap-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={previewUrl}
                                        alt="Face searched"
                                        className="w-14 h-14 object-cover rounded-full border-2 border-primary shadow-sm"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                            Tìm thấy {results.length} bức ảnh
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Khớp với khuôn mặt của bạn
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setResults(null)}>
                                    Tìm ảnh khác
                                </Button>
                            </div>

                            {results.length > 0 ? (
                                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                                    {results.map((img) => (
                                        <Dialog key={img.id}>
                                            <DialogTrigger asChild>
                                                <div className="relative group break-inside-avoid rounded-xl
                                                 overflow-hidden bg-gray-100 shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer">
                                                    <img
                                                        src={img.imageUrl}
                                                        alt="Event photo"
                                                        className="w-full h-auto object-cover"
                                                        loading="lazy"
                                                    />

                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                        {/* Icon xem trước cho rõ ràng */}
                                                        <div className="p-2 bg-white/20 rounded-full text-white">
                                                            <Maximize2 className="w-5 h-5" />
                                                        </div>

                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="rounded-full shadow-md z-10"
                                                            onClick={(e) => handleDownload(e, img.imageUrl, img.id)}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogTrigger>

                                            <DialogContent className="max-w-5xl max-h-[90vh] p-0 border-none bg-slate-900
             shadow-none flex justify-center items-center text-white">
                                                <img
                                                    src={img.imageUrl}
                                                    alt="Event photo Full"
                                                    className="max-w-full max-h-[90vh] object-contain rounded-md"
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="relative mb-4 opacity-50 grayscale">
                                        <img src={previewUrl} className="w-20 h-20 object-cover rounded-full" />
                                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
                                            <Frown className="w-6 h-6 text-gray-400" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-medium">Không tìm thấy khoảnh khắc nào</h4>
                                    <p className="text-gray-500 mt-2 max-w-sm">AI không phát hiện thấy khuôn mặt này trong thư viện ảnh. Bạn thử chụp lại một bức selfie thẳng mặt và rõ nét hơn nhé.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FaceSearch;