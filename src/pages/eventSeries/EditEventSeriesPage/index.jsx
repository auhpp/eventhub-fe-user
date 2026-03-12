import { EventSeriesContext } from "@/context/EventSeriesContext";
import EventSeriesForm from "@/features/eventSeries/EventSeriesForm";
import { updateEventSeries } from "@/services/eventSeriesService";
import { useContext, useState } from "react";
import { toast } from "sonner";

const EditEventSeriesPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { eventSeries, getEventSeriesInit } = useContext(EventSeriesContext)

    const handleFormSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await updateEventSeries({ id: eventSeries.id, formData });
            await getEventSeriesInit()
            toast.success("Cập nhật thành công!");
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
                    {'Cập nhật chuỗi sự kiện'}
                </h1>
            </div>

            <EventSeriesForm
                isUpdate={true}
                initialData={eventSeries}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
            />
        </div>
    )
};

export default EditEventSeriesPage;