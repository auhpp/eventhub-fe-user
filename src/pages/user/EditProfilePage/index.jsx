import React from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditProfilePage from "./EditProfile";
import FollowingList from "./FollowingList";

const ProfileLayoutPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentTab = searchParams.get("tab") || "edit";

    const handleTabChange = (value) => {
        setSearchParams({ tab: value });
    };

    return (
        <div className="">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Quản lý tài khoản</h1>

            <Tabs
                value={currentTab}
                onValueChange={handleTabChange}
                className="w-full flex flex-col gap-6"
            >
                {/* Tabs List */}
                <div className="w-full">
                    <TabsList className="flex flex-row h-auto w-fit bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger
                            value="edit"
                            className="flex items-center py-2 rounded-md text-gray-600
                             data-[state=active]:bg-white  data-[state=active]:shadow-sm 
                             transition-all font-medium"
                        >
                            Chỉnh sửa hồ sơ
                        </TabsTrigger>

                        <TabsTrigger
                            value="following"
                            className="flex items-center py-2 rounded-md text-gray-600
                             data-[state=active]:bg-white  
                             data-[state=active]:shadow-sm transition-all font-medium"
                        >
                            Đang theo dõi
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/*  Content  */}
                <div className="w-full min-w-0">
                    <TabsContent value="edit" className="mt-0">
                        <EditProfilePage />
                    </TabsContent>

                    <TabsContent value="following" className="mt-0">
                        <FollowingList />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default ProfileLayoutPage;