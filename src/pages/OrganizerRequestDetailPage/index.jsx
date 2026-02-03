import React, { useEffect, useState } from "react";
import {
    X, Mail, Phone, MapPin,
    Clock, User, Building2, AlertCircle, Calendar,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "react-router-dom";
import { cancelOrganizerRegistrationRequest, getOrganizerRegistrationById } from "@/services/organizerRegistrationService";
import { HttpStatusCode } from "axios";
import { ConfirmCancelModal } from "@/components/ConfirmCancelModal";
import { StatusBadge } from "@/components/StatusBadge";
import { RegistrationStatus } from "@/utils/constant";
import ButtonBack from "@/components/ButtonBack";


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
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

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
                                <Building2 size={14} /> ID: <span className="font-mono">#{organizerRegistration.id}</span>
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} /> Gửi ngày: {new Date(organizerRegistration.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons  */}
                {organizerRegistration.status === RegistrationStatus.PENDING && (
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            onClick={() => setShowCancelModal(true)}
                            variant="destructive" className="bg-red-50 text-destructive hover:bg-red-100 border border-red-200 shadow-sm">
                            <X size={16} className="mr-2" /> Hủy
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- ORGANIZER INFO --- */}
                <div className="lg:col-span-2 space-y-6">

                    <Card>
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Hồ sơ Tổ chức / Doanh nghiệp</CardTitle>
                                    <CardDescription>Thông tin chi tiết về pháp nhân đăng ký</CardDescription>
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
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Đại diện pháp lý</label>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <User size={16} className="text-muted-foreground" /> {organizerRegistration.representativeFullName}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Email liên hệ</label>
                                        <p className="text-sm font-medium text-primary hover:underline cursor-pointer flex items-center gap-2">
                                            <Mail size={16} className="text-muted-foreground" /> {organizerRegistration.email}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Số điện thoại</label>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Phone size={16} className="text-muted-foreground" /> {organizerRegistration.phoneNumber}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Địa chỉ trụ sở</label>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <MapPin size={16} className="text-muted-foreground" /> {organizerRegistration.contactAddress}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Biography Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Giới thiệu (Biography)</label>
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
                                        <AvatarImage src={organizerRegistration.appUser?.avatar} alt={organizerRegistration.appUser?.fullName} />
                                        <AvatarFallback className="text-lg">{organizerRegistration.appUser?.fullName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    
                                    {organizerRegistration.appUser.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full ring-1 ring-white/10"></span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">{organizerRegistration.appUser.fullName}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Tham gia: {new Date(organizerRegistration.appUser.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shrink-0 text-muted-foreground">
                                        <Mail size={14} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-muted-foreground">Email tài khoản</p>
                                        <p className="text-sm font-medium truncate" title={organizerRegistration.appUser.email}>{organizerRegistration.appUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shrink-0 text-muted-foreground">
                                        <Phone size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">SĐT tài khoản</p>
                                        <p className="text-sm font-medium">{organizerRegistration.appUser.phoneNumber || "Chưa cập nhật"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shrink-0 text-muted-foreground">
                                        <Clock size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Hoạt động gần nhất</p>
                                        <p className="text-sm font-medium">
                                            {organizerRegistration.appUser.lastSeen ? new Date(organizerRegistration.appUser.lastSeen).toLocaleString('vi-VN') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Alert variant="default" className="bg-blue-50 text-blue-900 border-blue-100 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800 py-3">
                                    <AlertCircle className="h-4 w-4 stroke-blue-600 dark:stroke-blue-400" />
                                    <AlertDescription className="text-xs ml-2">
                                        Hãy đối chiếu thông tin doanh nghiệp và tài khoản cá nhân trước khi duyệt.
                                    </AlertDescription>
                                </Alert>
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