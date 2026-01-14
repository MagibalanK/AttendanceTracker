import { CircularProgress } from './CircularProgress';

interface StatusCardProps {
  percentage: number;
  status: 'critical' | 'warning' | 'safe';
  statusText: string;
  message: string;
}

export function StatusCard({ percentage, status, statusText, message }: StatusCardProps) {
  const bgColorMap = {
    critical: 'var(--critical-bg)',
    warning: 'var(--warning-bg)',
    safe: 'var(--safe-bg)'
  };

  const textColorMap = {
    critical: 'var(--critical-text)',
    warning: 'var(--warning-text)',
    safe: 'var(--safe-text)'
  };

  return (
    <div style={{
      backgroundColor: 'var(--card)',
      borderRadius: '1rem',
      padding: '2rem',
      border: '2px solid var(--border)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <p style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--muted-foreground)',
            fontWeight: 500,
            marginBottom: '0.5rem'
          }}>
            Current Status
          </p>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            backgroundColor: bgColorMap[status],
            marginBottom: '0.75rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: textColorMap[status],
              margin: 0
            }}>
              {statusText}
            </h2>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
            maxWidth: '20rem',
            lineHeight: 1.5
          }}>
            {message}
          </p>
        </div>
        <div>
          <CircularProgress percentage={percentage} status={status} size={170} strokeWidth={12} />
        </div>
      </div>
    </div>
  );
}
