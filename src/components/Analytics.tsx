import { useState, useEffect } from 'react';
import { Moon, Sun, RotateCcw, CircleAlert, Shield, Lightbulb } from 'lucide-react';
import { InputControl } from './InputControl';
import { StatusCard } from './StatusCard';
import { MetricCard } from './MetricCard';
import { ForecastChart } from './ForecastChart';
import { Slider } from './ui/slider';

interface AnalyticsProps {
  totalClasse: number;        // int
  attendedClasse: number;     // int
  isDar?: boolean;            // bool (optional if you want)
}


export default function Analytics({
  totalClasse,
  attendedClasse,
  isDar = false,
}: AnalyticsProps) {
  const [totalClasses, setTotalClasses] = useState<number>(totalClasse);
  const [attendedClasses, setAttendedClasses] = useState<number>(attendedClasse);
   const [isDark, setIsDark] = useState<boolean>(isDar);

    const [targetPercentage, setTargetPercentage] = useState(75);


  // Calculate attendance percentage
  const currentAttendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

  // Determine status
  const getStatus = (): 'critical' | 'warning' | 'safe' => {
    if (currentAttendance < targetPercentage - 10) return 'critical';
    if (currentAttendance < targetPercentage) return 'warning';
    return 'safe';
  };

  const status = getStatus();

  // Calculate bunks left (classes that can be skipped while maintaining target)
  const calculateBunksLeft = (): number => {
    if (totalClasses === 0) return 0;
    
    // Formula: bunksLeft = attended - (target% * total) / (100 - target%)
    const minRequired = (targetPercentage * totalClasses) / 100;
    const bunks = Math.floor(attendedClasses - minRequired);
    return Math.max(0, bunks);
  };

  // Calculate classes needed to recover
  const calculateClassesToRecover = (): number => {
    if (currentAttendance >= targetPercentage) return 0;
    
    // Formula to find classes needed: (target% * (total + x) - attended) / (1 - target%)
    // Where x is number of classes to attend
    let classesToAttend = 0;
    let futureTotal = totalClasses;
    let futureAttended = attendedClasses;
    
    while (futureTotal < 1000) { // Safety limit
      const futurePercentage = (futureAttended / futureTotal) * 100;
      if (futurePercentage >= targetPercentage) break;
      
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
    if (status === 'critical') return 'Critical!';
    if (status === 'warning') return 'Be Careful!';
    return 'Safe';
  };



  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      padding: '1.5rem',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {/* Left Sidebar - Input Controls */}
          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '400px'
          }}>
            <div style={{
              backgroundColor: 'var(--card)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0
                }}>
                  <span style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    display: 'inline-block'
                  }}></span>
                  Input Data
                </h2>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
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
                  onChange={(val) => setAttendedClasses(Math.min(val, totalClasses))}
                  min={0}
                  max={totalClasses}
                />
              </div>
            </div>

            {/* Requirement Slider */}
            <div style={{
              backgroundColor: 'var(--card)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)'
                }}></div>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  margin: 0
                }}>
                  Requirement
                </h3>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--muted-foreground)'
                  }}>
                    Target %
                  </span>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}>
                    {targetPercentage}%
                  </span>
                </div>
<Slider
  value={[targetPercentage]}
  onValueChange={(values) => setTargetPercentage(values[0])}
  min={0}
  max={100}
  step={1}
  style={{
    margin: '1rem 0',
    filter: document.documentElement.classList.contains('dark')
      ? 'invert(1)'
      : 'invert(0)',
  }}
/>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--muted-foreground)'
                }}>
                  <span>0%</span>
                  <span style={{
                    fontSize: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Keep it real
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            {/*<div style={{
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning)',
              borderRadius: '0.75rem',
              padding: '1.25rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.75rem'
              }}>
                <Lightbulb style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'var(--warning)',
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }} />
                <div>
                  <h4 style={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                    color: 'var(--warning-text)'
                  }}>
                    Pro Tip:
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--warning-text)',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    Always keep a 5% buffer for unexpected sick days!
                  </p>
                </div>
              </div>
            </div>*/}
          </aside>

          {/* Main Content Area */}
          <main style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            flex: 1
          }}>
            {/* Status Card */}
            <StatusCard
              percentage={currentAttendance}
              status={status}
              statusText={getStatusText()}
              message={getStatusMessage()}
            />

            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <MetricCard
                title="Bunks Left"
                value={bunksLeft}
                subtitle="SAFE SKIPS"
                icon={Shield}
                variant={bunksLeft > 0 ? 'info' : 'default'}
              />
              <MetricCard
                title="To Recover"
                value={classesToRecover}
                subtitle="ATTEND NEXT"
                icon={CircleAlert}
                variant={classesToRecover > 0 ? 'critical' : 'safe'}
              />
            </div>

            {/* Forecast Chart */}
            <ForecastChart
              currentAttendance={currentAttendance}
              totalClasses={totalClasses}
              attendedClasses={attendedClasses}
              targetPercentage={targetPercentage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
