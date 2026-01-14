import { Minus, Plus } from 'lucide-react';

interface InputControlProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function InputControl({ 
  label, 
  sublabel, 
  value, 
  onChange, 
  min = 0, 
  max = 999 
}: InputControlProps) {
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div>
        <label style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--card-foreground)'
        }}>
          {label}
        </label>
        {sublabel && (
          <p style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--muted-foreground)',
            marginTop: '0.125rem'
          }}>
            {sublabel}
          </p>
        )}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--muted)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value <= min ? 'not-allowed' : 'pointer',
            opacity: value <= min ? 0.4 : 1,
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (value > min) e.currentTarget.style.backgroundColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          aria-label="Decrement"
        >
          <Minus style={{ width: '1rem', height: '1rem' }} />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          style={{
            flex: 1,
            height: '3rem',
            padding: '0 1rem',
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: 600,
            backgroundColor: 'var(--muted)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            outline: 'none',
            color: 'var(--foreground)',
            transition: 'box-shadow 0.2s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(3, 2, 19, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--muted)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value >= max ? 'not-allowed' : 'pointer',
            opacity: value >= max ? 0.4 : 1,
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (value < max) e.currentTarget.style.backgroundColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          aria-label="Increment"
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
        </button>
      </div>
    </div>
  );
}
