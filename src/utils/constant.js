export const RegistrationStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
};

export const Role = {
    ADMIN: "ADMIN",
    ORGANIZER: "ORGANIZER",
    USER: "USER",
};


export const MeetingPlatform = {
    ZOOM: 'ZOOM',
    GOOGLE_MEET: 'GOOGLE_MEET',
};


export const RoleName = {
    ADMIN: {
        label: "Quản trị viên",
        key: 'ADMIN'
    },
    USER: {
        label: "Người dùng",
        key: 'USER'
    },
    ORGANIZER: {
        label: "Nhà tổ chức",
        key: 'ORGANIZER'
    },
    EVENT_OWNER: {
        label: "Chủ sự kiện",
        key: 'EVENT_OWNER'
    },
    EVENT_ADMIN: {
        label: "Quản trị viên",
        key: 'EVENT_ADMIN'
    },
    EVENT_MANAGER: {
        label: "Quản lý",
        key: 'EVENT_MANAGER'
    },
    EVENT_STAFF: {
        label: "Nhân viên - checkin",
        key: 'EVENT_STAFF'
    }
}

export const EventStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
}

export const WalletType = {
    VNPay: 'VNPay'
}

export const BookingStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    CANCELLED_BY_EVENT: 'CANCELLED_BY_EVENT',
    CANCELLED_BY_USER: 'CANCELLED_BY_USER',
    REFUNDED_CANCELLED_BY_EVENT: 'REFUNDED_CANCELLED_BY_EVENT',
    REFUNDED_CANCELLED_BY_USER: 'REFUNDED_CANCELLED_BY_USER',
    REFUNDED: 'REFUNDED'
}

export const AttendeeStatus = {
    INACTIVE: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-700", key: 'INACTIVE' },
    VALID: { label: "Chưa check-in", color: "bg-gray-100 text-gray-700", key: 'VALID' },
    CHECKED_IN: { label: "Đã check-in", color: "bg-blue-100 text-blue-700", key: 'CHECKED_IN' },
    CANCELLED_BY_EVENT: { label: "Đã hủy bởi sự kiện", color: "bg-red-100 text-red-700", key: 'CANCELLED_BY_EVENT' },
    CANCELLED_BY_USER: { label: "Đã hủy bởi bạn", color: "bg-red-100 text-red-700", key: 'CANCELLED_BY_USER' },
    COMING: { label: "Sắp đến", key: 'COMING' },
    PAST: { label: "Đã qua", key: 'PAST' },

};

export const EventType = {
    ONLINE: { key: "ONLINE", name: "Online", color: "bg-blue-100 text-blue-700" },
    OFFLINE: { key: "OFFLINE", name: "Offline", color: "bg-purple-100 text-purple-700" },
};

export const TicketStatus = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SOLD_OUT: 'SOLD_OUT',
    EXPIRED: 'EXPIRED'
}

export const AttendeeType = {
    BUY: 'BUY',
    INVITE: 'INVITE'
}

export const InvitationStatus = {
    PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED', REVOKED: 'REVOKED', EXPIRED: 'EXPIRED'
}


export const EventStaffStatus = {
    PENDING: 'PENDING', ACTIVE: 'ACTIVE', REJECTED: 'REJECTED', REVOKED: 'REVOKED'
}

export const SourceType = {
    PURCHASE: 'PURCHASE', GIFT: 'GIFT', INVITATION: 'INVITATION'
}


export const TicketGiftStatus = {
    PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED', REVOKED: 'REVOKED', EXPIRED: 'EXPIRED'
}
export const DiscountType = {
    PERCENTAGE: 'PERCENTAGE',
    FIXED_AMOUNT: 'FIXED_AMOUNT',
}


export const SortType = {
    NEWEST: 'NEWEST',
    OLDEST: 'OLDEST',
}
