import React, { useEffect, useState } from "react";
import {
    Mail, Phone,
    AlertCircle, 
    Loader2,
    Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "react-router-dom";
import { cancelOrganizerRegistrationRequest, getOrganizerRegistrationById } from "@/services/organizerRegistrationService";
import { HttpStatusCode } from "axios";
import { ConfirmCancelModal } from "@/components/ConfirmCancelModal";
import { StatusBadge } from "@/components/StatusBadge";
import { OrganizerType, RegistrationStatus } from "@/utils/constant";
import ButtonBack from "@/components/ButtonBack";
import DefaultAvatar from "@/components/DefaultAvatar";
import { formatDateTime } from "@/utils/format";


const OrganizerRequestDetail = () => {
    const [organizerRegistration, setOrganizerRegistration] = useState(null);
    const location = useLocation();
    const organizerRegistrationId = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
    const [isRefresh, setIsRefresh] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleCancelEvent = async () => {
        console.log("Đã hủy sự kiện");
        try {
            const response = await cancelOrganizerRegistrationRequest({ id: organizerRegistrationId })
            if (response.code == HttpStatusCode.Ok) {
                setIsRefresh(prev => !prev)
                setShowCancelModal(false);
            }
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(
        () => {
            const fetchorganizerRegistration = async () => {
                try {
                    const response = await getOrganizerRegistrationById({ id: organizerRegistrationId })
                    setOrganizerRegistration(response.result)
                } catch (error) {
                    console.log(error)
                }
            }
            fetchorganizerRegistration()
        }, [isRefresh, organizerRegistrationId]
    )

    if (!organizerRegistration) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className=" space-y-6">

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <ButtonBack />
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">
                                {organizerRegistration.businessName}
                            </h1>
                            <StatusBadge status={organizerRegistration.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                ID: <span className="font-mono">#{organizerRegistration.id}</span>
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1.5">
                                Gửi ngày: {formatDateTime(organizerRegistration.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons  */}
                {organizerRegistration.status === RegistrationStatus.PENDING && (
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            onClick={() => setShowCancelModal(true)}
                            variant="destructive"
                            size="sm"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Hủy
                        </Button>

                    </div>
                )}
            </div>

            {/* --- STATUS ALERT--- */}
            {organizerRegistration.status === RegistrationStatus.REJECTED && organizerRegistration.rejectionReason && (
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Yêu cầu này đã bị từ chối</AlertTitle>
                    <AlertDescription>
                        Lý do: {organizerRegistration.rejectionReason}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* --- ORGANIZER INFO --- */}
                <div className="lg:col-span-2 space-y-6">

                    <Card>
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-center gap-2">
                                <div>
                                    <CardTitle className="text-lg">Hồ sơ đăng ký</CardTitle>
                                    <CardDescription>Thông tin chi tiết đăng ký</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-6 mb-8">
                                {/* Business Avatar */}
                                <div className="shrink-0">
                                    <img
                                        src={organizerRegistration.businessAvatarUrl}
                                        alt="Business Logo"
                                        className="w-32 h-32 rounded-xl object-cover border shadow-sm bg-muted"
                                    />
                                </div>
                                {/* Basic Fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                                            Người đại diện

                                        </label>
                                        <p className="text-sm font-medium">
                                            {organizerRegistration.representativeFullName}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Email liên hệ</label>
                                        <p className="text-sm font-medium ">
                                            {organizerRegistration.email}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Loại hình</label>
                                        <p className="text-sm font-medium">
                                            {organizerRegistration.type == OrganizerType.PERSONAL ? "Cá nhân" : "Tổ chức"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Mã số thuế</label>
                                        <p className="text-sm font-medium">
                                            {organizerRegistration.taxCode}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Số điện thoại</label>
                                        <p className="text-sm font-medium">
                                            {organizerRegistration.phoneNumber}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Địa chỉ trụ sở</label>
                                        <p className="text-sm font-medium flex items-start gap-2">
                                            {organizerRegistration.contactAddress}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Biography Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Giới thiệu</label>
                                <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground/90 leading-relaxed border">
                                    {organizerRegistration.biography}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- APP USER INFO --- */}
                <div className="lg:col-span-1 space-y-6">

                    <Card>
                        <CardHeader className="pb-4 border-b bg-muted/30">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tài khoản đăng ký</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                        <DefaultAvatar user={organizerRegistration.appUser} />
                                    </Avatar>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">{organizerRegistration.appUser.fullName}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Tham gia: {new Date(organizerRegistration.appUser.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shrink-0 text-muted-foreground">
                                        <Mail size={14} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate" title={organizerRegistration.appUser.email}>{organizerRegistration.appUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shrink-0 text-muted-foreground">
                                        <Phone size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{organizerRegistration.appUser.phoneNumber || "Chưa cập nhật"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
            <ConfirmCancelModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelEvent}
                title="Hủy đăng ký ban tổ chức"
                itemLabel=""
                note=""
                confirmText="Đồng ý hủy"
            />

        </div>
    );
};

export default OrganizerRequestDetail;