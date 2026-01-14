import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Calendar, CheckCircle2, XCircle, Shield, AlertTriangle, } from "lucide-react";
import { Card } from "./ui/card";
export function AttendanceStats({ total, attended, missed, bunksLeft, toRecover, }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(StatCard, { icon: _jsx(Calendar, {}), label: "Total Classes", value: total, color: "blue" }), _jsx(StatCard, { icon: _jsx(CheckCircle2, {}), label: "Attended", value: attended, color: "green" }), _jsx(StatCard, { icon: _jsx(XCircle, {}), label: "Missed", value: missed, color: "red" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4", children: [_jsx(Card, { className: "p-5 rounded-2xl", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Bunks Left" }), _jsx("p", { className: "text-3xl font-semibold", children: bunksLeft }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Safe skips" })] }), _jsx(Shield, { className: "h-5 w-5 text-gray-400" })] }) }), _jsx(Card, { className: "p-5 rounded-2xl bg-red-50 border-red-200 dark:bg-red-900/20", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-red-600", children: "To Recover" }), _jsx("p", { className: "text-3xl font-semibold text-red-700", children: toRecover }), _jsx("p", { className: "text-xs text-red-500 mt-1", children: "Attend next" })] }), _jsx(AlertTriangle, { className: "h-5 w-5 text-red-500" })] }) })] })] }));
}
function StatCard({ icon, label, value, color, }) {
    const colors = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40",
        green: "bg-green-100 text-green-600 dark:bg-green-900/40",
        red: "bg-red-100 text-red-600 dark:bg-red-900/40",
    };
    return (_jsx(Card, { className: "p-5 rounded-2xl", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `h-11 w-11 rounded-xl flex items-center justify-center ${colors[color]}`, children: icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: label }), _jsx("p", { className: "text-2xl font-semibold", children: value })] })] }) }));
}
