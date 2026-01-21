import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatDateTime = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
};

export const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
};


export const formatTime = (dateString) => {
    return format(new Date(dateString), "HH:mm", { locale: vi });
};


export function getDayInWeek(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    const daysOfWeek = [
        'CN',
        'T2',
        'T3',
        'T4',
        'T5',
        'T6',
        'T7'
    ];

    return daysOfWeek[date.getDay()];
}