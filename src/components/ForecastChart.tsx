import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ForecastChartProps {
  currentAttendance: number;
  totalClasses: number;
  attendedClasses: number;
  targetPercentage: number;
}

export function ForecastChart({ 
  currentAttendance, 
  totalClasses, 
  attendedClasses, 
  targetPercentage 
}: ForecastChartProps) {
  // Generate forecast data
  const generateForecastData = () => {
    const data = [];
    const forecastLength = 10;
    
    // Add current point
    data.push({
      class: totalClasses,
      attendance: parseFloat(currentAttendance.toFixed(2)),
      isCurrent: true
    });

    // Calculate future attendance if attending all classes
    let futureTotal = totalClasses;
    let futureAttended = attendedClasses;
    
    for (let i = 1; i <= forecastLength; i++) {
      futureTotal += 1;
      futureAttended += 1; // Assuming attending future classes
      const futureAttendance = (futureAttended / futureTotal) * 100;
      
      data.push({
        class: futureTotal,
        attendance: parseFloat(futureAttendance.toFixed(2)),
        isCurrent: false
      });
    }

    return data;
  };

  const forecastData = generateForecastData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
            marginBottom: '0.25rem'
          }}>
            Class {payload[0].payload.class}
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            margin: 0
          }}>
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      backgroundColor: 'var(--card)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '0.25rem'
          }}>
            Forecast
          </h3>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
            margin: 0
          }}>
            Projection for the next 10 classes
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
            marginBottom: '0.25rem'
          }}>
            Goal
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            margin: 0
          }}>
            {targetPercentage}%
          </p>
        </div>
      </div>
      
      <div style={{ height: '16rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border)" 
              vertical={false}
            />
            <XAxis 
              dataKey="class" 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={targetPercentage} 
              stroke="var(--muted-foreground)" 
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Line 
              type="monotone" 
              dataKey="attendance" 
              stroke="var(--critical)" 
              strokeWidth={3}
              dot={{ fill: 'var(--critical)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
