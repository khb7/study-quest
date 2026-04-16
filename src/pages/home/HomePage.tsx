import { useState, useEffect } from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { useStudyTimer, getPomodoroPhaseSeconds } from '@/hooks/useStudyTimer';
import type { PomodoroConfig } from '@/hooks/useStudyTimer';
import TimerRing from './components/TimerRing';
import StudyModal from './components/StudyModal';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import StatUpdateScreen from './components/StatUpdateScreen';

type HomeScreen = 'timer' | 'quiz' | 'result' | 'stat';
type TimerMode = 'normal' | 'pomodoro';
type PomodoroNotice = 'study-done' | 'break-done' | null;

const HomePage: React.FC = () => {
  const todayMinutes = useStudyStore((s) => s.todayMinutes);
  const currentSubject = useStudyStore((s) => s.currentSubject);

  // --- Pomodoro state ---
  const [timerMode, setTimerMode] = useState<TimerMode>('normal');
  const [pomPhase, setPomPhase] = useState<PomodoroConfig['phase']>('study');
  const [pomRound, setPomRound] = useState(1);
  const [pomNotice, setPomNotice] = useState<PomodoroNotice>(null);
  const [cumulativeStudySeconds, setCumulativeStudySeconds] = useState(0);

  const pomodoroConfig: PomodoroConfig | undefined =
    timerMode === 'pomodoro' ? { phase: pomPhase, round: pomRound } : undefined;

  const {
    timerState,
    elapsedSeconds,
    formattedTime,
    progress,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
  } = useStudyTimer(pomodoroConfig);

  // --- Pomodoro phase completion detection ---
  useEffect(() => {
    if (timerMode !== 'pomodoro' || timerState !== 'studying' || pomNotice !== null) return;
    const phaseSeconds = getPomodoroPhaseSeconds({ phase: pomPhase, round: pomRound });
    if (elapsedSeconds >= phaseSeconds) {
      pauseTimer();
      if (pomPhase === 'study') {
        setCumulativeStudySeconds((prev) => prev + phaseSeconds);
        setPomNotice('study-done');
      } else {
        setPomNotice('break-done');
      }
    }
  }, [elapsedSeconds, timerState, timerMode, pomPhase, pomRound, pomNotice, pauseTimer]);

  // --- Screen / modal state ---
  const [screen, setScreen] = useState<HomeScreen>('timer');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedElapsedSeconds, setSavedElapsedSeconds] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);

  const todayFormatted = (() => {
    const h = Math.floor(todayMinutes / 60);
    const m = todayMinutes % 60;
    if (h > 0) return `${h}시간 ${String(m).padStart(2, '0')}분`;
    return `${String(m).padStart(2, '0')}분`;
  })();

  const isStudying = timerState === 'studying';
  const isPaused = timerState === 'paused';
  const isActive = isStudying || isPaused;

  // Total studied seconds (for pomodoro: cumulative + current study phase only)
  const totalStudiedSeconds =
    timerMode === 'pomodoro'
      ? cumulativeStudySeconds +
        (pomPhase === 'study'
          ? Math.min(elapsedSeconds, getPomodoroPhaseSeconds({ phase: 'study', round: pomRound }))
          : 0)
      : elapsedSeconds;

  const totalStudiedFormatted = (() => {
    const m = Math.floor(totalStudiedSeconds / 60);
    const s = totalStudiedSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();

  // --- Handlers ---
  const handleStop = () => {
    stopTimer();
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    setSavedElapsedSeconds(timerMode === 'pomodoro' ? totalStudiedSeconds : elapsedSeconds);
    setIsModalOpen(false);
    resetTimer();
    if (timerMode === 'pomodoro') {
      setCumulativeStudySeconds(0);
      setPomPhase('study');
      setPomRound(1);
    }
    setScreen('quiz');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetTimer();
  };

  const handleQuizComplete = (correctCount: number) => {
    setQuizCorrectCount(correctCount);
    setScreen('result');
  };

  const handleQuizSkip = () => setScreen('stat');
  const handleResultContinue = () => setScreen('stat');
  const handleStatDone = () => setScreen('timer');

  // Pomodoro notice actions
  const handlePomodoroBreakStart = () => {
    setPomNotice(null);
    setPomPhase('break');
    resetTimer();
  };

  const handlePomodoroNextRound = () => {
    setPomNotice(null);
    setPomPhase('study');
    setPomRound((r) => Math.min(r + 1, 4));
    resetTimer();
  };

  const handlePomodoroComplete = () => {
    setPomNotice(null);
    setSavedElapsedSeconds(cumulativeStudySeconds);
    resetTimer();
    setCumulativeStudySeconds(0);
    setPomPhase('study');
    setPomRound(1);
    setScreen('quiz');
  };

  const switchMode = (mode: TimerMode) => {
    setTimerMode(mode);
    resetTimer();
    setCumulativeStudySeconds(0);
    setPomPhase('study');
    setPomRound(1);
    setPomNotice(null);
  };

  // --- Non-timer screens ---
  if (screen === 'quiz') {
    return (
      <QuizScreen
        subject={currentSubject || '기타'}
        onComplete={handleQuizComplete}
        onSkip={handleQuizSkip}
      />
    );
  }
  if (screen === 'result') {
    return (
      <ResultScreen
        correctCount={quizCorrectCount}
        totalCount={3}
        onContinue={handleResultContinue}
      />
    );
  }
  if (screen === 'stat') {
    return (
      <StatUpdateScreen
        subject={currentSubject || '기타'}
        elapsedSeconds={savedElapsedSeconds}
        onDone={handleStatDone}
      />
    );
  }

  // --- Derived display values ---
  const isPomodoro = timerMode === 'pomodoro';
  const isBreak = isPomodoro && pomPhase === 'break';
  const ringColor = isBreak ? 'purple' : 'gold';
  const centerLabel = isBreak
    ? isStudying ? '휴식중...' : '곧 휴식하세요'
    : isStudying ? '학습중...' : '집중하세요';

  const ambientColor = isBreak
    ? 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)';

  // --- Timer screen ---
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#0F0F1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 24px',
        paddingTop: 'calc(48px + env(safe-area-inset-top))',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes ambientPulse {
          0%, 100% { opacity: 1;    transform: translate(-50%, -50%) scale(1);    }
          50%       { opacity: 1.6; transform: translate(-50%, -50%) scale(1.18); }
        }
      `}</style>

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: ambientColor,
          pointerEvents: 'none',
          animation: isStudying ? 'ambientPulse 2.5s ease-in-out infinite' : undefined,
          transition: 'background 600ms ease',
        }}
      />

      {/* Top: today's study time */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4, letterSpacing: '0.5px' }}>
          오늘의 학습
        </div>
        <div style={{ fontSize: 14, color: '#C9A84C', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {todayFormatted}
        </div>
      </div>

      {/* Mode toggle (only when idle and not in active session) */}
      {!isActive && !pomNotice && (
        <div
          style={{
            display: 'flex',
            backgroundColor: '#1A1A2E',
            borderRadius: 24,
            padding: 4,
            marginBottom: 32,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {(['normal', 'pomodoro'] as const).map((mode) => {
            const active = timerMode === mode;
            return (
              <button
                key={mode}
                onClick={() => switchMode(mode)}
                style={{
                  height: 36,
                  padding: '0 20px',
                  borderRadius: 20,
                  border: 'none',
                  backgroundColor: active ? '#C9A84C' : 'transparent',
                  color: active ? '#0F0F1A' : 'rgba(255,255,255,0.45)',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  letterSpacing: '-0.2px',
                }}
              >
                {mode === 'normal' ? '일반' : '🍅 포모도로'}
              </button>
            );
          })}
        </div>
      )}

      {/* Pomodoro round indicator (when active) */}
      {isPomodoro && isActive && !pomNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            backgroundColor: '#1A1A2E',
            borderRadius: 20,
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ fontSize: 14 }}>{isBreak ? '☕' : '🍅'}</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            {pomRound} / 4 라운드
          </span>
          <span
            style={{
              fontSize: 12,
              color: isBreak ? '#A78BFA' : '#C9A84C',
              fontWeight: 600,
              marginLeft: 4,
            }}
          >
            {isBreak ? '휴식중' : '공부중'}
          </span>
        </div>
      )}

      {/* No-round-indicator spacer for normal mode */}
      {(!isPomodoro || !isActive || pomNotice) && isActive && (
        <div style={{ marginBottom: 24 }} />
      )}

      {/* Timer ring */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <TimerRing
          progress={progress}
          formattedTime={formattedTime}
          isStudying={isStudying}
          ringColor={ringColor}
          centerLabel={centerLabel}
        />

        {/* Pomodoro phase notice overlay */}
        {pomNotice && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#1A1A2E',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '28px 28px 24px',
              textAlign: 'center',
              zIndex: 10,
              minWidth: 270,
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>
              {pomNotice === 'study-done' ? '🍅' : '☕'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
              {pomNotice === 'study-done'
                ? `${pomRound}라운드 완료!`
                : '휴식 완료!'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 22 }}>
              {pomNotice === 'study-done'
                ? pomRound >= 4
                  ? '15분 긴 휴식을 취하세요'
                  : '5분 휴식을 취하세요'
                : pomRound < 4
                  ? '다음 라운드를 시작하세요'
                  : '4라운드 모두 완료했어요!'}
            </div>

            {pomNotice === 'study-done' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handlePomodoroBreakStart}
                  style={{
                    height: 44,
                    backgroundColor: '#A78BFA',
                    border: 'none',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {pomRound >= 4 ? '15분 휴식하기' : '5분 휴식하기'}
                </button>
                <button
                  onClick={handlePomodoroComplete}
                  style={{
                    height: 40,
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  오늘 학습 완료
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pomRound < 4 && (
                  <button
                    onClick={handlePomodoroNextRound}
                    style={{
                      height: 44,
                      backgroundColor: '#C9A84C',
                      border: 'none',
                      borderRadius: 12,
                      color: '#0F0F1A',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    다음 라운드 시작
                  </button>
                )}
                <button
                  onClick={handlePomodoroComplete}
                  style={{
                    height: pomRound >= 4 ? 44 : 40,
                    backgroundColor: pomRound >= 4 ? '#C9A84C' : 'transparent',
                    border: pomRound >= 4 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    color: pomRound >= 4 ? '#0F0F1A' : 'rgba(255,255,255,0.5)',
                    fontSize: pomRound >= 4 ? 14 : 13,
                    fontWeight: pomRound >= 4 ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  학습 완료
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      {!pomNotice && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 56,
          }}
        >
          {!isActive ? (
            <button
              onClick={startTimer}
              style={{
                width: 200,
                height: 56,
                backgroundColor: isBreak ? '#A78BFA' : '#C9A84C',
                border: 'none',
                borderRadius: 28,
                color: isBreak ? '#FFFFFF' : '#0F0F1A',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isBreak
                  ? '0 0 24px rgba(167,139,250,0.4)'
                  : '0 0 24px rgba(201,168,76,0.4)',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                letterSpacing: '-0.3px',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              {isBreak ? '휴식 시작' : '시작하기'}
            </button>
          ) : (
            <>
              <button
                onClick={isStudying ? pauseTimer : startTimer}
                style={{
                  width: 140,
                  height: 56,
                  backgroundColor: 'transparent',
                  border: `1.5px solid ${isBreak ? '#A78BFA' : '#C9A84C'}`,
                  borderRadius: 28,
                  color: isBreak ? '#A78BFA' : '#C9A84C',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, transform 150ms ease',
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {isStudying ? '일시정지' : '재개'}
              </button>

              <button
                onClick={handleStop}
                style={{
                  width: 140,
                  height: 56,
                  backgroundColor: '#C9A84C',
                  border: 'none',
                  borderRadius: 28,
                  color: '#0F0F1A',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(201,168,76,0.35)',
                  transition: 'transform 150ms ease, box-shadow 150ms ease',
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                완료
              </button>
            </>
          )}
        </div>
      )}

      {/* Study modal */}
      <StudyModal
        isOpen={isModalOpen}
        elapsedSeconds={timerMode === 'pomodoro' ? totalStudiedSeconds : elapsedSeconds}
        formattedElapsed={timerMode === 'pomodoro' ? totalStudiedFormatted : formattedTime}
        onSave={handleModalSave}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default HomePage;
