export interface GachaCharacter {
  id: string;
  name: string;
  grade: 'S' | 'A' | 'B' | 'C';
  subject: string;
  description: string;
}

export const GRADE_COLORS: Record<GachaCharacter['grade'], {
  border: string;
  bg: string;
  text: string;
  glow: string;
}> = {
  S: { border: '#C9A84C', bg: '#2D1B69', text: '#C9A84C', glow: 'rgba(201,168,76,0.5)' },
  A: { border: '#60A5FA', bg: '#1B2D4F', text: '#60A5FA', glow: 'rgba(96,165,250,0.4)' },
  B: { border: '#4ADE80', bg: '#1B2D1B', text: '#4ADE80', glow: 'rgba(74,222,128,0.3)' },
  C: { border: '#9CA3AF', bg: '#2D2D1B', text: '#9CA3AF', glow: 'none' },
};

export const SUBJECT_ICONS: Record<string, string> = {
  수학: '📐',
  프로그래밍: '💻',
  과학: '🔬',
  영어: '📖',
  국어: '📝',
  사회: '🌏',
  기타: '⭐',
};

export const ALL_CHARACTERS: GachaCharacter[] = [
  // S grade (3)
  { id: 's1', name: '수학의 신 피타고라스', grade: 'S', subject: '수학', description: '삼각형의 비밀을 아는 자' },
  { id: 's2', name: '코드마스터 튜링', grade: 'S', subject: '프로그래밍', description: '모든 알고리즘의 아버지' },
  { id: 's3', name: '언어의 여신 세종', grade: 'S', subject: '국어', description: '문자를 창조한 위대한 왕' },
  // A grade (5)
  { id: 'a1', name: '물리학자 뉴턴', grade: 'A', subject: '과학', description: '사과나무 아래의 천재' },
  { id: 'a2', name: '탐험가 다윈', grade: 'A', subject: '과학', description: '진화론을 발견한 탐험가' },
  { id: 'a3', name: '수학자 오일러', grade: 'A', subject: '수학', description: '수학의 황제' },
  { id: 'a4', name: '철학자 소크라테스', grade: 'A', subject: '사회', description: '너 자신을 알라' },
  { id: 'a5', name: '언어학자 촘스키', grade: 'A', subject: '영어', description: '언어의 구조를 밝힌 자' },
  // B grade (6)
  { id: 'b1', name: '지리학자 훔볼트', grade: 'B', subject: '사회', description: '자연을 사랑한 탐험가' },
  { id: 'b2', name: '화학자 퀴리', grade: 'B', subject: '과학', description: '방사능을 발견한 과학자' },
  { id: 'b3', name: '수학자 가우스', grade: 'B', subject: '수학', description: '어린 천재 수학자' },
  { id: 'b4', name: '작가 셰익스피어', grade: 'B', subject: '영어', description: '희곡의 대가' },
  { id: 'b5', name: '철학자 칸트', grade: 'B', subject: '사회', description: '순수이성비판의 저자' },
  { id: 'b6', name: '개발자 리누스', grade: 'B', subject: '프로그래밍', description: '리눅스를 만든 핀란드인' },
  // C grade (6)
  { id: 'c1', name: '견습 수학자', grade: 'C', subject: '수학', description: '아직 배우는 중' },
  { id: 'c2', name: '코딩 입문자', grade: 'C', subject: '프로그래밍', description: 'Hello World를 출력했다' },
  { id: 'c3', name: '영어 초보', grade: 'C', subject: '영어', description: '알파벳은 다 외웠다' },
  { id: 'c4', name: '과학 꿈나무', grade: 'C', subject: '과학', description: '실험을 좋아하는 학생' },
  { id: 'c5', name: '독서왕', grade: 'C', subject: '국어', description: '책을 많이 읽는 아이' },
  { id: 'c6', name: '역사 탐구자', grade: 'C', subject: '사회', description: '역사책을 즐겨 읽는다' },
];

const WEIGHTS: Record<GachaCharacter['grade'], number> = { S: 3, A: 15, B: 35, C: 47 };

function rollGrade(): GachaCharacter['grade'] {
  const r = Math.random() * 100;
  if (r < WEIGHTS.S) return 'S';
  if (r < WEIGHTS.S + WEIGHTS.A) return 'A';
  if (r < WEIGHTS.S + WEIGHTS.A + WEIGHTS.B) return 'B';
  return 'C';
}

function randomFromPool(grade: GachaCharacter['grade']): GachaCharacter {
  const pool = ALL_CHARACTERS.filter((c) => c.grade === grade);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pullOne(): GachaCharacter {
  return randomFromPool(rollGrade());
}

export function pullTen(): GachaCharacter[] {
  const results = Array.from({ length: 10 }, () => pullOne());
  const hasHighTier = results.some((c) => c.grade === 'S' || c.grade === 'A');
  if (!hasHighTier) {
    results[9] = randomFromPool('A');
  }
  return results;
}
