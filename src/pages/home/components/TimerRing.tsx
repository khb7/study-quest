interface TimerRingProps {
  progress: number;
  formattedTime: string;
  isStudying: boolean;
}

const RADIUS = 115;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerRing: React.FC<TimerRingProps> = ({ progress, formattedTime, isStudying }) => {
  const offset = CIRCUMFERENCE * (1 - progress);

  // 1. 끝점 좌표 계산 (12시 방향 = -90deg 기준, 시계방향)
  const angle = -Math.PI / 2 + progress * 2 * Math.PI;
  const dotX = 130 + RADIUS * Math.cos(angle);
  const dotY = 130 + RADIUS * Math.sin(angle);

  return (
    <div style={{ position: 'relative', width: 260, height: 260 }}>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1;   transform: scale(1);   }
          50%       { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes textPulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.7;  }
        }
      `}</style>

      <svg width="260" height="260" viewBox="0 0 260 260" style={{ display: 'block' }}>
        <defs>
          {/* 링 호흡 글로우 — 블러 강함 */}
          <filter id="ring-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* 끝점 글로우 */}
          <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* 기존 링 글로우 */}
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

        {/* 3. 호흡 글로우 레이어 (progress arc 뒤에 겹쳐서 맥박 효과) */}
        {isStudying && (
          <circle
            cx="130"
            cy="130"
            r={RADIUS}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="12"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 130 130)"
            filter="url(#ring-glow)"
            style={{
              animation: 'glowPulse 2.5s ease-in-out infinite',
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}

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

        {/* 1. 끝점 빛나는 점 */}
        {isStudying && progress > 0 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={7}
            fill="#E8CC7A"
            filter="url(#dot-glow)"
            style={{
              animation: 'dotPulse 2.5s ease-in-out infinite',
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
        )}
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

        {/* 2. 학습중 텍스트 점멸 */}
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.5px',
            animation: isStudying ? 'textPulse 2.5s ease-in-out infinite' : undefined,
          }}
        >
          {isStudying ? '학습중...' : '집중하세요'}
        </span>
      </div>
    </div>
  );
};

export default TimerRing;
