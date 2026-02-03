import ImageUploadField from "@/components/ImageUploadField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ImageUploadSession = ({ form, isEditing = false }) => {

    return (
        <>
            <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="size-7 rounded-lg bg-blue-600 text-white 
                                flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                        Upload hình ảnh
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 ">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 rounded-xl">
                        {/* Poster*/}
                        <div className="md:col-span-4">
                            <ImageUploadField
                                form={form}
                                name="poster" 
                                label="Thêm ảnh sự kiện"
                                recommendSize="720x958"
                                ratio={720 / 958}
                                minWidth={720}
                                minHeight={958}
                                isShowCloseButton={!isEditing}
                            />
                        </div>

                        {/* Thumbnail*/}
                        <div className="md:col-span-8">
                            <ImageUploadField
                                form={form}
                                name="thumbnail" 
                                label="Thêm ảnh nền sự kiện"
                                recommendSize="1280x720"
                                ratio={16 / 9}
                                minWidth={1280}
                                minHeight={720}
                                isShowCloseButton={!isEditing}

                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default ImageUploadSession