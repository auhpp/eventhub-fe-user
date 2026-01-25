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
    ADMIN: 'ADMIN',
    USER: 'USER',
    ORGANIZER: 'ORGANIZER'
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
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED'
}

export const AttendeeStatus = {
    INACTIVE: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-700" },
    VALID: { label: "Hợp lệ", color: "bg-emerald-100 text-emerald-700" },
    CHECKED_IN: { label: "Đã check-in", color: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
    COMING: { label: "Sắp đến" },
    PAST: { label: "Đã qua" },

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