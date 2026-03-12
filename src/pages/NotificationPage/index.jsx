import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Calendar, Folder, UserPlus, Gift } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import DefaultPagination from '@/components/DefaultPagination';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { routes } from '@/config/routes';
import { NotificationType } from '@/utils/constant';

const renderNotificationContent = (notif) => {
    const { type, subject, target, message } = notif;

    switch (type) {
        case NotificationType.CREATE_EVENT_SESSION:
            return (
                <span>
                    Đã tạo phiên mới <strong>{target}</strong> cho sự kiện <strong>{subject}</strong>.
                </span>
            );
        case NotificationType.CATEGORY_EVENT:
            return (
                <span>
                    Sự kiện <strong>{target}</strong> vừa được thêm vào danh mục <strong>{subject}</strong>.
                </span>
            );
        case NotificationType.INVITE_EVENT:
            return (
                <span>
                    Bạn nhận được lời mời tham gia sự kiện <strong>{target}</strong> từ <strong>{subject}</strong>.
                </span>
            );
        case NotificationType.GIFT_TICKET:
            return (
                <span>
                    Bạn vừa nhận được vé tặng tham gia sự kiện <strong>{target}</strong> từ <strong>{subject}</strong>.
                </span>
            );
        default:
            return <span>{message || 'Bạn có một thông báo mới.'}</span>;
    }
};

const getIconByType = (type) => {
    switch (type) {
        case NotificationType.CREATE_EVENT_SESSION: return <Calendar className="h-4 w-4 text-blue-500" />;
        case NotificationType.CATEGORY_EVENT: return <Folder className="h-4 w-4 text-yellow-500" />;
        case NotificationType.INVITE_EVENT: return <UserPlus className="h-4 w-4 text-green-500" />;
        case NotificationType.GIFT_TICKET: return <Gift className="h-4 w-4 text-purple-500" />;
        default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
};

const getNotificationUrl = (type, targetId) => {
    if (!targetId) return null;

    switch (type) {
        case NotificationType.CREATE_EVENT_SESSION:
        case NotificationType.INVITE_EVENT:
            return routes.eventDetail.replace(':id', targetId);
        case NotificationType.CATEGORY_EVENT:
            return routes.categoryDetail.replace(':categoryId', targetId);
        case NotificationType.GIFT_TICKET:
            return routes.ticketGifts;
        default:
            return null;
    }
};

const NotificationPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 4;

    const {
        notifications,
        pageInfo,
        isLoading,
        fetchNotifications,
        handleMarkAsRead,
        handleDelete
    } = useNotifications();

    useEffect(() => {
        fetchNotifications(currentPage, pageSize);
    }, [currentPage, pageSize, fetchNotifications]);


    const handleNotificationClick = async (notif) => {
        if (!notif.seen) {
            await handleMarkAsRead(notif.id);
        }

        const targetUrl = getNotificationUrl(notif.type, notif.targetId);
        if (targetUrl) {
            navigate(targetUrl);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Bell className="h-6 w-6 text-brand" />
                        Thông báo của bạn
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Cập nhật các hoạt động và sự kiện mới nhất.
                    </p>
                </div>
            </div>

            {/* notification list */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-gray-100/50"></div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                    <Bell className="h-10 w-10 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Không có thông báo nào</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`group relative flex gap-4 rounded-xl border p-4 transition-all hover:shadow-md 
                                cursor-pointer ${notif.seen ? 'bg-background border-border' : 'bg-blue-50/50 border-blue-100'
                                }`}
                        >
                            {/* Avatar / Icon */}
                            <div className="relative mt-1 hidden sm:block">
                                <Avatar className="h-12 w-12 border border-gray-100 shadow-sm">
                                    <AvatarImage src={notif.subjectAvatar || notif.targetAvatar} alt={notif.subject} />
                                    <AvatarFallback className="bg-white">
                                        {getIconByType(notif.type)}
                                    </AvatarFallback>
                                </Avatar>
                                {!notif.seen && (
                                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-brand 
                                    border-2 border-white"></span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {!notif.seen && (
                                        <span className="h-2 w-2 rounded-full bg-brand sm:hidden"></span>
                                    )}
                                    <h4 className={`text-base font-medium ${notif.seen ? 'text-gray-700' :
                                         'text-foreground font-semibold'}`}>
                                        {notif.subject || 'Hệ thống'}
                                    </h4>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {renderNotificationContent(notif)}
                                </p>
                                <span className="text-xs text-gray-400 mt-2 block">
                                    {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.seen && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleMarkAsRead(notif.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-brand hover:bg-white rounded-md 
                                        transition-colors shadow-sm border border-transparent hover:border-gray-200"
                                        title="Đánh dấu đã đọc"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleDelete(notif.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-md 
                                    transition-colors shadow-sm border border-transparent hover:border-gray-200"
                                    title="Xóa thông báo"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="mt-5">
                <DefaultPagination
                    currentPage={currentPage}
                    setSearchParams={setSearchParams}
                    totalPages={pageInfo.totalPages}
                    totalElements={pageInfo.totalElements}
                    pageSize={pageSize}
                />
            </div>
        </div>
    );
};

export default NotificationPage;