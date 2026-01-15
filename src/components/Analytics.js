import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CircleAlert, Shield } from 'lucide-react';
import { InputControl } from './InputControl';
import { StatusCard } from './StatusCard';
import { MetricCard } from './MetricCard';
import { ForecastChart } from './ForecastChart';
import { Slider } from './ui/slider';
export default function Analytics({ totalClasse, attendedClasse, }) {
    const [totalClasses, setTotalClasses] = useState(totalClasse);
    const [attendedClasses, setAttendedClasses] = useState(attendedClasse);
    const [targetPercentage, setTargetPercentage] = useState(75);
    const currentAttendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
    const getStatus = () => {
        if (currentAttendance < targetPercentage - 10)
            return 'critical';
        if (currentAttendance < targetPercentage)
            return 'warning';
        return 'safe';
    };
    const status = getStatus();
    const bunksLeft = Math.max(0, Math.floor(attendedClasses - (targetPercentage * totalClasses) / 100));
    const calculateRecover = () => {
        if (currentAttendance >= targetPercentage)
            return 0;
        let t = totalClasses;
        let a = attendedClasses;
        let c = 0;
        while ((a / t) * 100 < targetPercentage) {
            t++;
            a++;
            c++;
            if (c > 500)
                break;
        }
        return c;
    };
    const classesToRecover = calculateRecover();
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '1rem',
        }, children: [_jsxs("div", { style: {
                    maxWidth: '1280px',
                    margin: '0 auto',
                    display: 'grid',
                    gap: '1.25rem',
                }, children: [_jsxs("div", { className: "analytics-top", children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem' }, children: [_jsx(StatusCard, { percentage: currentAttendance, status: status, statusText: status === 'critical'
                                            ? 'Critical!'
                                            : status === 'warning'
                                                ? 'Be Careful!'
                                                : 'Safe', message: status === 'critical'
                                            ? 'Attendance required immediately!'
                                            : status === 'warning'
                                                ? 'Almost there! Keep attending classes.'
                                                : "You're doing great!" }), _jsxs("div", { className: "metric-grid", children: [_jsx(MetricCard, { title: "Bunks Left", value: bunksLeft, subtitle: "SAFE SKIPS", icon: Shield }), _jsx(MetricCard, { title: "To Recover", value: classesToRecover, subtitle: "ATTEND NEXT", icon: CircleAlert, variant: classesToRecover > 0 ? 'critical' : 'safe' })] })] }), _jsx(ForecastChart, { currentAttendance: currentAttendance, totalClasses: totalClasses, attendedClasses: attendedClasses, targetPercentage: targetPercentage })] }), _jsxs("div", { className: "input-slider-row", children: [_jsxs("div", { className: "card", children: [_jsx("h3", { className: "card-title", children: "Input Data" }), _jsxs("div", { className: "input-stack", children: [_jsx(InputControl, { label: "Total Classes", sublabel: "CONDUCTED", value: totalClasses, onChange: setTotalClasses, min: 0, max: 500 }), _jsx(InputControl, { label: "Attended", sublabel: "PRESENT", value: attendedClasses, onChange: (v) => setAttendedClasses(Math.min(v, totalClasses)), min: 0, max: totalClasses })] })] }), _jsxs("div", { className: "cards", children: [_jsxs("div", { className: "slider-header", children: [_jsx("span", { className: "slider-label", children: "Target %" }), _jsxs("span", { className: "slider-value", children: [targetPercentage, "%"] })] }), _jsx(Slider, { value: [targetPercentage], onValueChange: (v) => setTargetPercentage(v[0]), min: 0, max: 100, step: 1 })] })] })] }), _jsx("style", { children: `
        /* DESKTOP */
        .analytics-top {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr 1fr;
        }

        .cards
        {
                  background: var(--card);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          height:100px !important
        }
        .metric-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, 1fr);
        }

        .input-slider-row {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;

        }

        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .card-title {
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .input-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .slider-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .slider-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        /* 📱 MOBILE */
        @media (max-width: 768px) {
          .analytics-top {
            grid-template-columns: 1fr;
          }

          .metric-grid {
            grid-template-columns: 1fr;
          }

          .input-slider-row {
            grid-template-columns: 1fr;
          }

          .card {
            padding: 1rem;
          }

          .slider-value {
            font-size: 1.25rem;
          }
        }
        ` })] }));
}
