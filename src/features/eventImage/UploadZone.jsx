import React, { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UploadZone = ({ onUpload, isUploading }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = (files) => {
        if (files && files.length > 0) {
            const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
            if (validFiles.length === 0) {
                toast.error("Vui lòng chỉ chọn file ảnh!");
                return;
            }
            onUpload(validFiles);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors 
        ${dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/30"}
        ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                ) : (
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                )}

                <h3 className="font-semibold text-lg">
                    {isUploading ? "Đang tải ảnh lên..." : "Kéo thả hoặc chọn ảnh"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Hỗ trợ JPG, PNG. Dung lượng tối đa 10MB/file.
                </p>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <Button
                    disabled={isUploading}
                    onClick={() => fileInputRef.current.click()}
                >
                    Chọn ảnh từ máy
                </Button>
            </div>
        </div>
    );
};

export default UploadZone;