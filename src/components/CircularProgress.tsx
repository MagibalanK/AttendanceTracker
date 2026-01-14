interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  status: 'critical' | 'warning' | 'safe';
}

export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 10,
  status 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    critical: 'var(--critical)',
    warning: 'var(--warning)',
    safe: 'var(--safe)'
  };

  const color = colorMap[status];

  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg 
        width={size} 
        height={size} 
        style={{
          transform: 'rotate(-90deg)'
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'all 0.5s ease-out'
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{
          fontSize: '1.875rem',
          fontWeight: 600,
          letterSpacing: '-0.025em'
        }}>
          {percentage.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
