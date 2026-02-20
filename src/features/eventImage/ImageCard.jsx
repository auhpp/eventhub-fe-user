import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; 
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig = {
    PENDING: { color: "bg-gray-500", icon: Clock, label: "Đang chờ" },
    PROCESSING: { color: "bg-yellow-500", icon: Loader2, label: "Đang xử lý", animate: true },
    COMPLETED: { color: "bg-green-500", icon: CheckCircle, label: "Hoàn tất" },
    FAILED: { color: "bg-red-500", icon: XCircle, label: "Lỗi" },
};

const ImageCard = ({ image }) => {
    const config = statusConfig[image.processStatus] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="group relative overflow-hidden rounded-lg border bg-white
                 shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-square relative">
                        <img
                            src={image.imageUrl}
                            alt={`Event Img ${image.id}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />

                        <div className="absolute top-2 right-2">
                            <Badge className={`${config.color} text-white hover:${config.color} gap-1 pr-2`}>
                                <Icon className={`h-3 w-3 ${config.animate ? "animate-spin" : ""}`} />
                                <span className="text-[10px] uppercase font-bold">{config.label}</span>
                            </Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <p className="text-xs text-white truncate">ID: {image.id}</p>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>

            <DialogContent className="max-w-5xl max-h-[90vh] p-0 border-none bg-slate-900
             shadow-none flex justify-center items-center text-white">
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