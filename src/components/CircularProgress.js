import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CircularProgress({ percentage, size = 120, strokeWidth = 10, status }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const colorMap = {
        critical: 'var(--critical)',
        warning: 'var(--warning)',
        safe: 'var(--safe)'
    };
    const color = colorMap[status];
    return (_jsxs("div", { style: {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        }, children: [_jsxs("svg", { width: size, height: size, style: {
                    transform: 'rotate(-90deg)'
                }, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: "var(--muted)", strokeWidth: strokeWidth, opacity: 0.2 }), _jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: color, strokeWidth: strokeWidth, strokeDasharray: circumference, strokeDashoffset: offset, strokeLinecap: "round", style: {
                            transition: 'all 0.5s ease-out'
                        } })] }), _jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }, children: _jsxs("span", { style: {
                        fontSize: '1.875rem',
                        fontWeight: 600,
                        letterSpacing: '-0.025em'
                    }, children: [percentage.toFixed(2), "%"] }) })] }));
}
