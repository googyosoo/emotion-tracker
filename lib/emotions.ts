// 무드미터 감정 데이터
// 4사분면: 빨강(고에너지-불쾌), 노랑(고에너지-유쾌), 초록(저에너지-유쾌), 파랑(저에너지-불쾌)

export interface Emotion {
    id: string;
    korean: string;
    english: string;
    quadrant: 'red' | 'yellow' | 'green' | 'blue';
    energy: 'high' | 'low';
    pleasantness: 'high' | 'low';
}

// 빨강 사분면 - 고에너지 + 불쾌 (High Energy, Low Pleasantness)
export const redEmotions: Emotion[] = [
    { id: 'enraged', korean: '격분한', english: 'Enraged', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'panicked', korean: '공황에 빠진', english: 'Panicked', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'stressed', korean: '스트레스 받는', english: 'Stressed', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'jittery', korean: '초조한', english: 'Jittery', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'shocked', korean: '충격받은', english: 'Shocked', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'livid', korean: '격노한', english: 'Livid', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'furious', korean: '몹시화가 난', english: 'Furious', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'frustrated', korean: '좌절한', english: 'Frustrated', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'tense', korean: '신경이 날카로운', english: 'Tense', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'stunned', korean: '망연자실한', english: 'Stunned', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'fuming', korean: '화가 치밀어오른', english: 'Fuming', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'frightened', korean: '겁먹은', english: 'Frightened', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'angry', korean: '화난', english: 'Angry', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'nervous', korean: '초조한', english: 'Nervous', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'restless', korean: '안절부절못하는', english: 'Restless', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'anxious', korean: '불안한', english: 'Anxious', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'apprehensive', korean: '우려하는', english: 'Apprehensive', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'worried', korean: '근심하는', english: 'Worried', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'irritated', korean: '짜증나는', english: 'Irritated', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'annoyed', korean: '거슬리는', english: 'Annoyed', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'repulsed', korean: '불쾌한', english: 'Repulsed', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'troubled', korean: '곤치아픈', english: 'Troubled', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'concerned', korean: '염려하는', english: 'Concerned', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'uneasy', korean: '마음이 불편한', english: 'Uneasy', quadrant: 'red', energy: 'high', pleasantness: 'low' },
    { id: 'peeved', korean: '안달은', english: 'Peeved', quadrant: 'red', energy: 'high', pleasantness: 'low' },
];

// 노랑 사분면 - 고에너지 + 유쾌 (High Energy, High Pleasantness)
export const yellowEmotions: Emotion[] = [
    { id: 'surprised', korean: '놀란', english: 'Surprised', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'upbeat', korean: '긍정적인', english: 'Upbeat', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'festive', korean: '흥겨운', english: 'Festive', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'exhilarated', korean: '아주 신나는', english: 'Exhilarated', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'ecstatic', korean: '황홀한', english: 'Ecstatic', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'hyper', korean: '들뜬', english: 'Hyper', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'cheerful', korean: '쾌활한', english: 'Cheerful', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'motivated', korean: '동기부여된', english: 'Motivated', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'inspired', korean: '영감을 받은', english: 'Inspired', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'elated', korean: '의기양양한', english: 'Elated', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'energized', korean: '기운이 넘치는', english: 'Energized', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'lively', korean: '활발한', english: 'Lively', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'excited', korean: '흥분한', english: 'Excited', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'optimistic', korean: '낙관적인', english: 'Optimistic', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'enthusiastic', korean: '열광하는', english: 'Enthusiastic', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'pleased', korean: '만족스러운', english: 'Pleased', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'focused', korean: '집중하는', english: 'Focused', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'happy', korean: '행복한', english: 'Happy', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'proud', korean: '자랑스러운', english: 'Proud', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'thrilled', korean: '짜릿한', english: 'Thrilled', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'pleasant', korean: '유쾌한', english: 'Pleasant', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'joyful', korean: '기쁜', english: 'Joyful', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'hopeful', korean: '희망찬', english: 'Hopeful', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'playful', korean: '재미있는', english: 'Playful', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
    { id: 'blissful', korean: '더없이 행복한', english: 'Blissful', quadrant: 'yellow', energy: 'high', pleasantness: 'high' },
];

// 초록 사분면 - 저에너지 + 유쾌 (Low Energy, High Pleasantness)
export const greenEmotions: Emotion[] = [
    { id: 'atEase', korean: '숨겨진', english: 'At Ease', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'easygoing', korean: '태연한', english: 'Easygoing', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'content', korean: '자족하는', english: 'Content', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'loving', korean: '다정한', english: 'Loving', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'fulfilled', korean: '충만한', english: 'Fulfilled', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'calm', korean: '평온한', english: 'Calm', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'secure', korean: '안전한', english: 'Secure', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'satisfied', korean: '만족스러운', english: 'Satisfied', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'grateful', korean: '감사하는', english: 'Grateful', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'touched', korean: '감격적인', english: 'Touched', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'relaxed', korean: '여유로운', english: 'Relaxed', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'chill', korean: '차분한', english: 'Chill', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'restful', korean: '편안한', english: 'Restful', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'blessed', korean: '축복받은', english: 'Blessed', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'balanced', korean: '안정적인', english: 'Balanced', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'mellow', korean: '하가로운', english: 'Mellow', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'thoughtful', korean: '생각이 깊긴', english: 'Thoughtful', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'peaceful', korean: '평화로운', english: 'Peaceful', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'comfortable', korean: '편한', english: 'Comfortable', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'carefree', korean: '근심 걱정 없는', english: 'Carefree', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'sleepy', korean: '나른한', english: 'Sleepy', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'complacent', korean: '호무한', english: 'Complacent', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'tranquil', korean: '고요한', english: 'Tranquil', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'cozy', korean: '아늑한', english: 'Cozy', quadrant: 'green', energy: 'low', pleasantness: 'high' },
    { id: 'serene', korean: '안온한', english: 'Serene', quadrant: 'green', energy: 'low', pleasantness: 'high' },
];

// 파랑 사분면 - 저에너지 + 불쾌 (Low Energy, Low Pleasantness)
export const blueEmotions: Emotion[] = [
    { id: 'disgusted', korean: '역겨운', english: 'Disgusted', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'glum', korean: '침울한', english: 'Glum', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'disappointed', korean: '실망스러운', english: 'Disappointed', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'down', korean: '의욕 없는', english: 'Down', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'apathetic', korean: '냉담한', english: 'Apathetic', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'pessimistic', korean: '비관적인', english: 'Pessimistic', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'morose', korean: '시무룩한', english: 'Morose', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'discouraged', korean: '낙담한', english: 'Discouraged', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'sad', korean: '슬픈', english: 'Sad', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'bored', korean: '지루한', english: 'Bored', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'alienated', korean: '소외된', english: 'Alienated', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'miserable', korean: '비참한', english: 'Miserable', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'lonely', korean: '쓸쓸한', english: 'Lonely', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'disheartened', korean: '기죽은', english: 'Disheartened', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'tired', korean: '피곤한', english: 'Tired', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'despondent', korean: '의기소침한', english: 'Despondent', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'depressed', korean: '우울한', english: 'Depressed', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'sullen', korean: '뚱한', english: 'Sullen', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'exhausted', korean: '기진맥진한', english: 'Exhausted', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'fatigued', korean: '지친', english: 'Fatigued', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'despairing', korean: '절망한', english: 'Despairing', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'hopeless', korean: '가망 없는', english: 'Hopeless', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'desolate', korean: '고독한', english: 'Desolate', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'spent', korean: '소모된', english: 'Spent', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
    { id: 'drained', korean: '진이 빠진', english: 'Drained', quadrant: 'blue', energy: 'low', pleasantness: 'low' },
];

// 모든 감정
export const allEmotions: Emotion[] = [
    ...redEmotions,
    ...yellowEmotions,
    ...greenEmotions,
    ...blueEmotions,
];

// 사분면별 색상
export const quadrantColors = {
    red: { bg: '#ef4444', hover: '#dc2626', text: '#ffffff', name: '빨강 (고에너지-불쾌)' },
    yellow: { bg: '#eab308', hover: '#ca8a04', text: '#000000', name: '노랑 (고에너지-유쾌)' },
    green: { bg: '#22c55e', hover: '#16a34a', text: '#ffffff', name: '초록 (저에너지-유쾌)' },
    blue: { bg: '#3b82f6', hover: '#2563eb', text: '#ffffff', name: '파랑 (저에너지-불쾌)' },
};

// 감정 ID로 감정 찾기
export function getEmotionById(id: string): Emotion | undefined {
    return allEmotions.find(e => e.id === id);
}

// 사분면별 감정 가져오기
export function getEmotionsByQuadrant(quadrant: 'red' | 'yellow' | 'green' | 'blue'): Emotion[] {
    switch (quadrant) {
        case 'red': return redEmotions;
        case 'yellow': return yellowEmotions;
        case 'green': return greenEmotions;
        case 'blue': return blueEmotions;
    }
}
