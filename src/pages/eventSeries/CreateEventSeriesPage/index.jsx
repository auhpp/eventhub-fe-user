import EventSeriesForm from "@/features/eventSeries/EventSeriesForm";
import { createEventSeries } from "@/services/eventSeriesService";
import { useState } from "react";
import { toast } from "sonner";

const CreateEventSeriesPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await createEventSeries({ formData });
            toast.success("Tạo mới thành công!");

        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen ">
            <div className="max-w-3xl mx-auto mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {'Tạo chuỗi sự kiện mới'}
                </h1>
            </div>

            <EventSeriesForm
                isUpdate={false}
                initialData={null}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
            />
        </div>
    )
};

export default CreateEventSeriesPage;