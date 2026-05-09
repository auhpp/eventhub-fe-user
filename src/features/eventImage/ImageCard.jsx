import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";

const statusConfig = {
    PENDING: { color: "bg-gray-500", icon: Clock, label: "Đang chờ" },
    PROCESSING: { color: "bg-yellow-500", icon: Loader2, label: "Đang xử lý", animate: true },
    COMPLETED: { color: "bg-green-500", icon: CheckCircle, label: "Hoàn tất" },
    FAILED: { color: "bg-red-500", icon: XCircle, label: "Lỗi" },
};

const ImageCard = ({ image, showStatus = false, onDelete }) => {
    const config = statusConfig[image.processStatus] || statusConfig.PENDING;
    const Icon = config.icon;

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
            onDelete(image.id);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="group relative h-full overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer">

                    <div className="relative w-full h-full aspect-[3/4] sm:aspect-square">
                        <img
                            src={image.imageUrl}
                            alt={`Event Img ${image.id}`}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />

                        {onDelete && (
                            <div className="absolute top-2 left-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-7 w-7 shadow-md"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {showStatus && (
                            <div className="absolute top-2 right-2 z-10">
                                <Badge className={`${config.color} text-white hover:${config.color} gap-1 pr-2 shadow-md`}>
                                    <Icon className={`h-3 w-3 ${config.animate ? "animate-spin" : ""}`} />
                                    <span className="text-[10px] uppercase font-bold">{config.label}</span>
                                </Badge>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                            <p className="text-xs text-white truncate">ID: {image.id}</p>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>

            <DialogContent className="max-w-5xl max-h-[90vh] p-0 border-none bg-slate-900 shadow-none flex justify-center items-center text-white">
                <img
                    src={image.imageUrl}
                    alt={`Event Img ${image.id} Full`}
                    className="max-w-full max-h-[90vh] object-contain rounded-md"
                />
            </DialogContent>
        </Dialog>
    );
};

export default ImageCard;