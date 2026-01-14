import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle, HelpCircle, ChevronLeft, ChevronRight, } from "lucide-react";
import { format, startOfWeek, addDays, subWeeks, addWeeks, } from "date-fns";
/* ================= COMPONENT ================= */
export function CalendarWeeklyView({ courses, records, onToggleAttendance, onWeekChange, onAddCompensation, }) {
    const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    useEffect(() => {
        onWeekChange(selectedWeekStart);
    }, [selectedWeekStart, onWeekChange]);
    const getWeekDates = () => Array.from({ length: 7 }).map((_, i) => addDays(selectedWeekStart, i));
    const getRecord = (courseId, date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return records.find((r) => r.courseId === courseId && r.date === dateStr);
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "present":
                return _jsx(CheckCircle2, { className: "h-4 w-4 text-green-600" });
            case "absent":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-600" });
            case "nodata":
                return _jsx(HelpCircle, { className: "h-4 w-4 text-gray-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "present":
                return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
            case "absent":
                return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
            case "nodata":
                return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
        }
    };
    const goToPreviousWeek = () => setSelectedWeekStart((prev) => subWeeks(prev, 1));
    const goToNextWeek = () => setSelectedWeekStart((prev) => addWeeks(prev, 1));
    return (_jsxs("div", { className: "space-y-6 text-sm sm:text-base", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [_jsx("h1", { className: "text-lg sm:text-xl font-semibold", children: "Weekly Timetable" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: onAddCompensation, children: "Add Compensation Class" }), _jsx(Button, { size: "icon", variant: "ghost", onClick: goToPreviousWeek, children: _jsx(ChevronLeft, {}) }), _jsxs("span", { className: "text-gray-600 dark:text-gray-400 font-medium", children: [format(selectedWeekStart, "MMM d"), " \u2013", " ", format(addDays(selectedWeekStart, 6), "MMM d, yyyy")] }), _jsx(Button, { size: "icon", variant: "ghost", onClick: goToNextWeek, children: _jsx(ChevronRight, {}) })] })] }), _jsx(Card, { className: "overflow-x-auto rounded-2xl shadow-sm", children: _jsxs("table", { className: "w-full border-collapse text-xs sm:text-sm", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "w-1/6 border p-2 sticky left-0 bg-white dark:bg-gray-900", children: "Course" }), getWeekDates().map((date, i) => {
                                        const isWeekend = i >= 5;
                                        return (_jsx("th", { className: `border p-2 text-center ${isWeekend ? "hidden sm:table-cell" : ""}`, children: format(date, "EEE dd/MM") }, date.toISOString()));
                                    })] }) }), _jsx("tbody", { children: courses.map((course) => (_jsxs("tr", { children: [_jsxs("td", { className: "border p-2 flex items-center gap-2 sticky left-0 bg-white dark:bg-gray-900", children: [_jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: course.color } }), _jsx("span", { className: "truncate", children: course.name })] }), getWeekDates().map((date, i) => {
                                        const isWeekend = i >= 5;
                                        const record = getRecord(course.id, date);
                                        return (_jsx("td", { className: `border p-1 text-center ${isWeekend ? "hidden sm:table-cell" : ""}`, children: record ? (_jsx("button", { onClick: () => onToggleAttendance(record.id), className: `flex items-center justify-center w-full px-2 py-1 rounded ${getStatusColor(record.status)}`, children: getStatusIcon(record.status) })) : (_jsx("span", { className: "text-gray-300", children: "\u2014" })) }, date.toISOString()));
                                    })] }, course.id))) })] }) })] }));
}
