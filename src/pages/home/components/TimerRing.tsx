interface TimerRingProps {
  progress: number;
  formattedTime: string;
  isStudying: boolean;
}

const RADIUS = 115;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerRing: React.FC<TimerRingProps> = ({ progress, formattedTime, isStudying }) => {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div style={{ position: 'relative', width: 260, height: 260 }}>
      <svg
        width="260"
        height="260"
        viewBox="0 0 260 260"
        style={{ display: 'block' }}
      >
        {/* Subtle glow filter */}
        <defs>
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx="130"
          cy="130"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />

        {/* Progress arc */}
        <circle
          cx="130"
          cy="130"
          r={RADIUS}
          fill="none"
          stroke="#C9A84C"
          strokeWidth="10"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 130 130)"
          filter={isStudying ? 'url(#gold-glow)' : undefined}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-2px',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {formattedTime}
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.5px',
          }}
        >
          {isStudying ? '학습중...' : '집중하세요'}
        </span>
      </div>
    </div>
  );
};

export default TimerRing;
