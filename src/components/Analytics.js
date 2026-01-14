import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CircleAlert, Shield } from 'lucide-react';
import { InputControl } from './InputControl';
import { StatusCard } from './StatusCard';
import { MetricCard } from './MetricCard';
import { ForecastChart } from './ForecastChart';
import { Slider } from './ui/slider';
export default function Analytics({ totalClasse, attendedClasse, isDar = false, }) {
    const [totalClasses, setTotalClasses] = useState(totalClasse);
    const [attendedClasses, setAttendedClasses] = useState(attendedClasse);
    const [isDark, setIsDark] = useState(isDar);
    const [targetPercentage, setTargetPercentage] = useState(75);
    // Calculate attendance percentage
    const currentAttendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
    // Determine status
    const getStatus = () => {
        if (currentAttendance < targetPercentage - 10)
            return 'critical';
        if (currentAttendance < targetPercentage)
            return 'warning';
        return 'safe';
    };
    const status = getStatus();
    // Calculate bunks left (classes that can be skipped while maintaining target)
    const calculateBunksLeft = () => {
        if (totalClasses === 0)
            return 0;
        // Formula: bunksLeft = attended - (target% * total) / (100 - target%)
        const minRequired = (targetPercentage * totalClasses) / 100;
        const bunks = Math.floor(attendedClasses - minRequired);
        return Math.max(0, bunks);
    };
    // Calculate classes needed to recover
    const calculateClassesToRecover = () => {
        if (currentAttendance >= targetPercentage)
            return 0;
        // Formula to find classes needed: (target% * (total + x) - attended) / (1 - target%)
        // Where x is number of classes to attend
        let classesToAttend = 0;
        let futureTotal = totalClasses;
        let futureAttended = attendedClasses;
        while (futureTotal < 1000) { // Safety limit
            const futurePercentage = (futureAttended / futureTotal) * 100;
            if (futurePercentage >= targetPercentage)
                break;
            classesToAttend++;
            futureTotal++;
            futureAttended++;
        }
        return classesToAttend;
    };
    const bunksLeft = calculateBunksLeft();
    const classesToRecover = calculateClassesToRecover();
    // Get status message
    const getStatusMessage = () => {
        if (status === 'critical') {
            return 'Attendance required immediately!';
        }
        if (status === 'warning') {
            return 'Almost there! Keep attending classes.';
        }
        return "You're doing great! Keep it up.";
    };
    const getStatusText = () => {
        if (status === 'critical')
            return 'Critical!';
        if (status === 'warning')
            return 'Be Careful!';
        return 'Safe';
    };
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: 'var(--background)',
            padding: '1.5rem',
            transition: 'background-color 0.3s ease, color 0.3s ease'
        }, children: _jsx("div", { style: {
                maxWidth: '1280px',
                margin: '0 auto'
            }, children: _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                }, children: [_jsxs("aside", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            maxWidth: '400px'
                        }, children: [_jsxs("div", { style: {
                                    backgroundColor: 'var(--card)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }, children: [_jsx("div", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '1.5rem'
                                        }, children: _jsxs("h2", { style: {
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                margin: 0
                                            }, children: [_jsx("span", { style: {
                                                        width: '0.5rem',
                                                        height: '0.5rem',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--primary)',
                                                        display: 'inline-block'
                                                    } }), "Input Data"] }) }), _jsxs("div", { style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1.5rem'
                                        }, children: [_jsx(InputControl, { label: "Total Classes", sublabel: "CONDUCTED", value: totalClasses, onChange: setTotalClasses, min: 0, max: 500 }), _jsx(InputControl, { label: "Attended", sublabel: "PRESENT", value: attendedClasses, onChange: (val) => setAttendedClasses(Math.min(val, totalClasses)), min: 0, max: totalClasses })] })] }), _jsxs("div", { style: {
                                    backgroundColor: 'var(--card)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '1rem'
                                        }, children: [_jsx("div", { style: {
                                                    width: '0.5rem',
                                                    height: '0.5rem',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--primary)'
                                                } }), _jsx("h3", { style: {
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    margin: 0
                                                }, children: "Requirement" })] }), _jsxs("div", { style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }, children: [_jsxs("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'space-between'
                                                }, children: [_jsx("span", { style: {
                                                            fontSize: '0.75rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            color: 'var(--muted-foreground)'
                                                        }, children: "Target %" }), _jsxs("span", { style: {
                                                            fontSize: '1.5rem',
                                                            fontWeight: 600
                                                        }, children: [targetPercentage, "%"] })] }), _jsx(Slider, { value: [targetPercentage], onValueChange: (values) => setTargetPercentage(values[0]), min: 0, max: 100, step: 1, style: {
                                                    margin: '1rem 0',
                                                    filter: document.documentElement.classList.contains('dark')
                                                        ? 'invert(1)'
                                                        : 'invert(0)',
                                                } }), _jsxs("div", { style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--muted-foreground)'
                                                }, children: [_jsx("span", { children: "0%" }), _jsx("span", { style: {
                                                            fontSize: '0.625rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }, children: "Keep it real" }), _jsx("span", { children: "100%" })] })] })] })] }), _jsxs("main", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            flex: 1
                        }, children: [_jsx(StatusCard, { percentage: currentAttendance, status: status, statusText: getStatusText(), message: getStatusMessage() }), _jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1.5rem'
                                }, children: [_jsx(MetricCard, { title: "Bunks Left", value: bunksLeft, subtitle: "SAFE SKIPS", icon: Shield, variant: bunksLeft > 0 ? 'info' : 'default' }), _jsx(MetricCard, { title: "To Recover", value: classesToRecover, subtitle: "ATTEND NEXT", icon: CircleAlert, variant: classesToRecover > 0 ? 'critical' : 'safe' })] }), _jsx(ForecastChart, { currentAttendance: currentAttendance, totalClasses: totalClasses, attendedClasses: attendedClasses, targetPercentage: targetPercentage })] })] }) }) }));
}
