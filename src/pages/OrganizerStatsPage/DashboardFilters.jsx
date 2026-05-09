import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    endOfMonth,
    endOfYear,
    startOfWeek, endOfWeek,
    subDays, format
} from 'date-fns';
import { RotateCcw } from 'lucide-react';

import DatePicker from '@/components/DatePicker';
import MonthPicker from '@/components/MonthPicker';
import YearPicker from '@/components/YearPicker';
import WeekPicker from '@/components/WeekPicker';

export const DashboardFilters = ({ filters, onFilterChange }) => {
    const [rangeMode, setRangeMode] = useState('date');


    const applyDateRange = (start, end) => {
        onFilterChange((prev) => ({
            ...prev,
            startDate: `${format(start, 'yyyy-MM-dd')}T00:00:00`,
            endDate: `${format(end, 'yyyy-MM-dd')}T23:59:59`
        }));
    };

    const handleRangeChange = (date, name, type) => {
        if (!date) return;

        let finalDate = date;
        if (type === 'month' && name === 'endDate') finalDate = endOfMonth(date);
        if (type === 'year' && name === 'endDate') finalDate = endOfYear(date);

        const timeSuffix = name === "startDate" ? "T00:00:00" : "T23:59:59";
        onFilterChange((prev) => ({
            ...prev,
            [name]: `${format(finalDate, 'yyyy-MM-dd')}${timeSuffix}`
        }));
    };

    const handleQuickFilter = (days) => {
        const today = new Date();
        applyDateRange(subDays(today, days), today);
    };

    const handleWeekSelect = (date) => {
        applyDateRange(startOfWeek(date, { weekStartsOn: 1 }), endOfWeek(date, { weekStartsOn: 1 }));
    };

    const handleClearFilters = () => {
        onFilterChange((prev) => ({
            ...prev,
            startDate: '',
            endDate: ''
        }));
        setRangeMode('date');
    };

    const hasActiveFilters = filters.startDate || filters.endDate;

    return (
        <div className="flex flex-col gap-5 p-5 mb-6 bg-white border rounded-lg shadow-sm relative">
            {/* Sesion 1 */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold uppercase text-muted-foreground mr-2">
                    Lọc nhanh:
                </span>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter(7)} className="h-8">
                    7 ngày qua
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter(30)} className="h-8">
                    30 ngày qua
                </Button>

                <div className="w-[1px] h-6 bg-gray-200 mx-1 hidden sm:block"></div>

                <WeekPicker onChange={handleWeekSelect} />
            </div>

            {/* Session 2 */}
            <div className="flex flex-wrap items-end gap-4 pt-4 border-t">
                <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Lọc theo</span>
                    <Select value={rangeMode} onValueChange={setRangeMode}>
                        <SelectTrigger className="w-[140px] h-10 rounded-lg">
                            <SelectValue placeholder="Chọn đơn vị" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">Khoảng Ngày</SelectItem>
                            <SelectItem value="month">Khoảng Tháng</SelectItem>
                            <SelectItem value="year">Khoảng Năm</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 min-w-[150px] max-w-[220px]">
                    {rangeMode === 'date' && (
                        <DatePicker value={filters.startDate}
                            onChange={(val) => handleRangeChange(new Date(val), "startDate", "date")} label="Từ ngày" />
                    )}
                    {rangeMode === 'month' && (
                        <MonthPicker value={filters.startDate}
                            onChange={(date) => handleRangeChange(date, "startDate", "month")} label="Từ tháng" />
                    )}
                    {rangeMode === 'year' && (
                        <YearPicker value={filters.startDate}
                            onChange={(date) => handleRangeChange(date, "startDate", "year")} label="Từ năm" />
                    )}
                </div>

                <div className="flex-1 min-w-[150px] max-w-[220px]">
                    {rangeMode === 'date' && (
                        <DatePicker value={filters.endDate}
                            onChange={(val) => handleRangeChange(new Date(val), "endDate", "date")} label="Đến ngày" />
                    )}
                    {rangeMode === 'month' && (
                        <MonthPicker value={filters.endDate}
                            onChange={(date) => handleRangeChange(date, "endDate", "month")} label="Đến tháng" />
                    )}
                    {rangeMode === 'year' && (
                        <YearPicker value={filters.endDate}
                            onChange={(date) => handleRangeChange(date, "endDate", "year")} label="Đến năm" />
                    )}
                </div>

                {/*  CLEAR FILTER */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={handleClearFilters}
                        className="h-10 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 
                        flex items-center gap-2 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Xóa bộ lọc</span>
                    </Button>
                )}
            </div>
        </div>
    );
};