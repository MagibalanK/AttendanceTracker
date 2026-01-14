import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, } from "recharts";
import { Card } from "./ui/card";
export function AttendanceForecast({ data, target }) {
    return (_jsxs(Card, { className: "p-6 rounded-2xl", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Forecast" }), _jsx("p", { className: "text-sm text-gray-500", children: "Projection for the next 10 classes" })] }), _jsx("div", { className: "h-56", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "4 4" }), _jsx(XAxis, { dataKey: "class" }), _jsx(YAxis, { domain: [60, 100], tickFormatter: (v) => `${v}%` }), _jsx(Tooltip, { formatter: (v) => `${v}%` }), _jsx(ReferenceLine, { y: target, stroke: "#888", strokeDasharray: "6 6", label: { value: `GOAL ${target}%`, position: "right" } }), _jsx(Line, { type: "monotone", dataKey: "percentage", stroke: "#ef4444", strokeWidth: 3, dot: { r: 4 } })] }) }) })] }));
}
