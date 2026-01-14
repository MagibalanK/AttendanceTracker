import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon?: LucideIcon;
  variant?: 'default' | 'critical' | 'safe' | 'warning' | 'info';
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  variant = 'default' 
}: MetricCardProps) {
  const bgColorMap = {
    default: 'var(--card)',
    critical: 'var(--critical-bg)',
    safe: 'var(--safe-bg)',
    warning: 'var(--warning-bg)',
    info: 'var(--info-bg)'
  };

  const textColorMap = {
    default: 'var(--card-foreground)',
    critical: 'var(--critical-text)',
    safe: 'var(--safe-text)',
    warning: 'var(--warning-text)',
    info: 'var(--info-text)'
  };

  const iconColorMap = {
    default: 'var(--muted-foreground)',
    critical: 'var(--critical)',
    safe: 'var(--safe)',
    warning: 'var(--warning)',
    info: 'var(--info)'
  };

  return (
    <div style={{
      backgroundColor: bgColorMap[variant],
      borderRadius: '0.75rem',
      padding: '1.25rem',
      border: '1px solid var(--border)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <span style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--muted-foreground)',
          fontWeight: 500
        }}>
          {title}
        </span>
        {Icon && <Icon style={{
          width: '1rem',
          height: '1rem',
          color: iconColorMap[variant]
        }} />}
      </div>
      <div style={{
        fontSize: '2.25rem',
        fontWeight: 600,
        marginBottom: '0.25rem',
        color: textColorMap[variant]
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        color: 'var(--muted-foreground)'
      }}>
        {subtitle}
      </div>
    </div>
  );
}
