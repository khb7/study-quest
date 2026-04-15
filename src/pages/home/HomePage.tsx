import { useState } from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import TimerRing from './components/TimerRing';
import StudyModal from './components/StudyModal';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import StatUpdateScreen from './components/StatUpdateScreen';

type HomeScreen = 'timer' | 'quiz' | 'result' | 'stat';

const HomePage: React.FC = () => {
  const todayMinutes = useStudyStore((s) => s.todayMinutes);
  const currentSubject = useStudyStore((s) => s.currentSubject);

  const {
    timerState,
    elapsedSeconds,
    formattedTime,
    progress,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
  } = useStudyTimer();

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

  const handleStop = () => {
    stopTimer();
    setIsModalOpen(true);
  };

  // Called when modal's "기록 저장하기" is tapped
  const handleModalSave = () => {
    setSavedElapsedSeconds(elapsedSeconds);
    setIsModalOpen(false);
    resetTimer();
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

  // Skipping quiz goes straight to stat update
  const handleQuizSkip = () => {
    setScreen('stat');
  };

  const handleResultContinue = () => {
    setScreen('stat');
  };

  const handleStatDone = () => {
    setScreen('timer');
  };

  // Non-timer screens render as full-screen overlays
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
      {/* Ambient background glow */}
      <style>{`
        @keyframes ambientPulse {
          0%, 100% { opacity: 1;    transform: translate(-50%, -50%) scale(1);    }
          50%       { opacity: 1.6; transform: translate(-50%, -50%) scale(1.18); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: isStudying ? 'ambientPulse 2.5s ease-in-out infinite' : undefined,
        }}
      />

      {/* Top section: today's study time */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4, letterSpacing: '0.5px' }}>
          오늘의 학습
        </div>
        <div style={{ fontSize: 14, color: '#C9A84C', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {todayFormatted}
        </div>
      </div>

      {/* Center: timer ring */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TimerRing progress={progress} formattedTime={formattedTime} isStudying={isStudying} />
      </div>

      {/* Bottom: buttons */}
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
              backgroundColor: '#C9A84C',
              border: 'none',
              borderRadius: 28,
              color: '#0F0F1A',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(201,168,76,0.4)',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              letterSpacing: '-0.3px',
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(201,168,76,0.3)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(201,168,76,0.4)';
            }}
          >
            시작하기
          </button>
        ) : (
          <>
            <button
              onClick={isStudying ? pauseTimer : startTimer}
              style={{
                width: 140,
                height: 56,
                backgroundColor: 'transparent',
                border: '1.5px solid #C9A84C',
                borderRadius: 28,
                color: '#C9A84C',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 150ms ease, transform 150ms ease',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(201,168,76,0.08)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
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
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(201,168,76,0.25)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(201,168,76,0.35)';
              }}
            >
              완료
            </button>
          </>
        )}
      </div>

      {/* Study modal */}
      <StudyModal
        isOpen={isModalOpen}
        elapsedSeconds={elapsedSeconds}
        formattedElapsed={formattedTime}
        onSave={handleModalSave}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default HomePage;
