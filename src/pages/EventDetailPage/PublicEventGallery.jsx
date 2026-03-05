import DefaultPagination from "@/components/DefaultPagination";
import ImageCard from "@/features/eventImage/ImageCard";
import { getEventImages } from "@/services/eventImageService";
import { ImageIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PublicEventGallery = ({ eventId }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 12;
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getEventImages({ eventId, page: currentPage, size: pageSize, status: "COMPLETED" });
            setImages(data.result.data || []);
            setTotalPages(data.result.totalPage || 1);
            setTotalElements(data.result.totalElements || 0);
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
        } finally {
            setLoading(false);
        }
    }, [eventId, currentPage]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);


    return (
        <div className="space-y-6">
            {loading && images.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : images.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
                        {images.map((img) => (
                            <ImageCard key={img.id} image={img} showStatus={false} />
                        ))}
                    </div>

                    <div className="mt-8">
                        <DefaultPagination
                            currentPage={currentPage}
                            setSearchParams={setSearchParams}
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
                    <p className="text-gray-500">Hình ảnh của sự kiện sẽ sớm được cập nhật tại đây.</p>
                </div>
            )}
        </div>
    );
};

export default PublicEventGallery