import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, ScanFace } from "lucide-react";

const FaceSearch = ({ onSearch, isSearching }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmitSearch = () => {
        if (!selectedFile) return;

        if (onSearch) {
            onSearch(selectedFile, previewUrl);
        }

        setIsOpen(false);
        setTimeout(() => {
            setSelectedFile(null);
            setPreviewUrl(null);
        }, 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={isSearching} className="bg-primary text-white gap-2 text-md px-6 rounded shadow">
                    <ScanFace className="w-5 h-5" />
                    {isSearching ? "Đang xử lý..." : "Tìm ảnh có mặt bạn"}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center">
                        Tải ảnh khuôn mặt của bạn
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
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
                            className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700
                             rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer 
                             hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
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
                        <div className="relative w-full max-w-xs mx-auto">
                            <img
                                src={previewUrl}
                                alt="Selfie Preview"
                                className="w-full h-64 object-cover rounded-2xl shadow-md border"
                            />
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black 
                                text-white rounded-full backdrop-blur-sm transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className="w-full flex justify-center mt-4">
                        <Button
                            size="lg"
                            disabled={!selectedFile}
                            onClick={handleSubmitSearch}
                            className="w-full gap-2"
                        >
                            <ScanFace className="w-5 h-5" />
                            Bắt đầu tìm kiếm
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FaceSearch;