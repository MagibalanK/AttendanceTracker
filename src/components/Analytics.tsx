import { useState } from 'react';
import { CircleAlert, Shield } from 'lucide-react';
import { InputControl } from './InputControl';
import { StatusCard } from './StatusCard';
import { MetricCard } from './MetricCard';
import { ForecastChart } from './ForecastChart';
import { Slider } from './ui/slider';

interface AnalyticsProps {
  totalClasse: number;
  attendedClasse: number;
  isDar?: boolean;
}

export default function Analytics({
  totalClasse,
  attendedClasse,
}: AnalyticsProps) {
  const [totalClasses, setTotalClasses] = useState(totalClasse);
  const [attendedClasses, setAttendedClasses] = useState(attendedClasse);
  const [targetPercentage, setTargetPercentage] = useState(75);

  const currentAttendance =
    totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

  const getStatus = (): 'critical' | 'warning' | 'safe' => {
    if (currentAttendance < targetPercentage - 10) return 'critical';
    if (currentAttendance < targetPercentage) return 'warning';
    return 'safe';
  };

  const status = getStatus();

  const bunksLeft = Math.max(
    0,
    Math.floor(attendedClasses * 100 / targetPercentage - totalClasses)
  );

  const calculateRecover = () => {
    if (currentAttendance >= targetPercentage) return 0;
    let t = totalClasses;
    let a = attendedClasses;
    let c = 0;
    while ((a / t) * 100 < targetPercentage) {
      t++;
      a++;
      c++;
      if (c > 500) break;
    }
    return c;
  };

  const classesToRecover = calculateRecover();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gap: '1.25rem',
        }}
      >
        {/* TOP SECTION */}
        <div className="analytics-top">
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <StatusCard
              percentage={currentAttendance}
              status={status}
              statusText={
                status === 'critical'
                  ? 'Critical!'
                  : status === 'warning'
                  ? 'Be Careful!'
                  : 'Safe'
              }
              message={
                status === 'critical'
                  ? 'Attendance required immediately!'
                  : status === 'warning'
                  ? 'Almost there! Keep attending classes.'
                  : "You're doing great!"
              }
            />

            <div className="metric-grid">
              <MetricCard
                title="Bunks Left"
                value={bunksLeft}
                subtitle="SAFE SKIPS"
                icon={Shield}
              />
              <MetricCard
                title="To Recover"
                value={classesToRecover}
                subtitle="ATTEND NEXT"
                icon={CircleAlert}
                variant={classesToRecover > 0 ? 'critical' : 'safe'}
              />
            </div>
          </div>

          {/* RIGHT */}
          <ForecastChart
            currentAttendance={currentAttendance}
            totalClasses={totalClasses}
            attendedClasses={attendedClasses}
            targetPercentage={targetPercentage}
          />
        </div>

        {/* INPUT + SLIDER */}
        <div className="input-slider-row">
          {/* INPUT CARD */}
          <div className="card">
            <h3 className="card-title">Input Data</h3>
            <div className="input-stack">
              <InputControl
                label="Total Classes"
                sublabel="CONDUCTED"
                value={totalClasses}
                onChange={setTotalClasses}
                min={0}
                max={500}
              />
              <InputControl
                label="Attended"
                sublabel="PRESENT"
                value={attendedClasses}
                onChange={(v) => setAttendedClasses(Math.min(v, totalClasses))}
                min={0}
                max={totalClasses}
              />
            </div>
          </div>

          {/* SLIDER CARD */}
          <div className="cards">
            <div className="slider-header">
              <span className="slider-label">Target %</span>
              <span className="slider-value">{targetPercentage}%</span>
            </div>

            <Slider
              value={[targetPercentage]}
              onValueChange={(v) => setTargetPercentage(v[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
}
