import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FilePreviewList = ({ files, onRemove }) => {
    if (files.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
                Ảnh đang chờ tải lên ({files.length})
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {files.map((file, index) => (
                    <Card key={`${file.name}-${index}`} className="relative group aspect-square overflow-hidden border-dashed">
                        <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="h-full w-full object-cover opacity-80"
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)} 
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onRemove(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                            <p className="text-[10px] text-white truncate text-center">{file.name}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default FilePreviewList;