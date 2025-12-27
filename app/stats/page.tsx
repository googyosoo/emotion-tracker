'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginButton from '@/components/LoginButton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { quadrantColors } from '@/lib/emotions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
);

interface EmotionRecord {
    id: string;
    date: string;
    time: string;
    todayEvent: string;
    gratitude: string;
    userName?: string;
    userEmail?: string;
    emotions: {
        id: string;
        korean: string;
        english: string;
        quadrant: 'red' | 'yellow' | 'green' | 'blue';
    }[];
    createdAt: any;
}

export default function StatsPage() {
    const { user, loading, isAdmin } = useAuth();
    const [records, setRecords] = useState<EmotionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [aiFeedback, setAiFeedback] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showApiInput, setShowApiInput] = useState(false);
    const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchRecords = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let q;

                if (isAdmin && viewMode === 'all') {
                    // 관리자: 모든 학생 기록 조회 (단순 쿼리로 변경)
                    q = query(
                        collection(db, 'emotions'),
                        limit(200)
                    );
                } else {
                    // 일반 사용자 (단순 쿼리로 변경)
                    q = query(
                        collection(db, 'emotions'),
                        where('userId', '==', user.uid),
                        limit(100)
                    );
                }

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as EmotionRecord[];

                setRecords(data);
            } catch (err: any) {
                console.error('데이터 로딩 오류:', err);
                if (err.code === 'failed-precondition') {
                    setError('Firestore 인덱스가 필요합니다.');
                } else {
                    setError('데이터를 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, [user, isAdmin, viewMode]);

    // 사분면별 통계 계산
    const quadrantStats = {
        red: 0,
        yellow: 0,
        green: 0,
        blue: 0,
    };

    records.forEach(record => {
        record.emotions?.forEach(emotion => {
            if (emotion.quadrant) {
                quadrantStats[emotion.quadrant]++;
            }
        });
    });

    const totalEmotions = Object.values(quadrantStats).reduce((a, b) => a + b, 0);

    // 도넛 차트 데이터
    const doughnutData = {
        labels: ['고에너지-불쾌 (빨강)', '고에너지-유쾌 (노랑)', '저에너지-유쾌 (초록)', '저에너지-불쾌 (파랑)'],
        datasets: [
            {
                data: [quadrantStats.red, quadrantStats.yellow, quadrantStats.green, quadrantStats.blue],
                backgroundColor: [
                    quadrantColors.red.bg,
                    quadrantColors.yellow.bg,
                    quadrantColors.green.bg,
                    quadrantColors.blue.bg,
                ],
                borderWidth: 0,
            },
        ],
    };

    // 최근 7일 라인 차트 데이터
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const lineDataByDay = last7Days.map(date => {
        const dayRecords = records.filter(r => r.date === date);
        const stats = { red: 0, yellow: 0, green: 0, blue: 0 };
        dayRecords.forEach(r => {
            r.emotions?.forEach(e => {
                if (e.quadrant) {
                    stats[e.quadrant]++;
                }
            });
        });
        return stats;
    });

    const lineData = {
        labels: last7Days.map(d => {
            const date = new Date(d);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        datasets: [
            {
                label: '빨강',
                data: lineDataByDay.map(d => d.red),
                borderColor: quadrantColors.red.bg,
                backgroundColor: `${quadrantColors.red.bg}40`,
                tension: 0.4,
            },
            {
                label: '노랑',
                data: lineDataByDay.map(d => d.yellow),
                borderColor: quadrantColors.yellow.bg,
                backgroundColor: `${quadrantColors.yellow.bg}40`,
                tension: 0.4,
            },
            {
                label: '초록',
                data: lineDataByDay.map(d => d.green),
                borderColor: quadrantColors.green.bg,
                backgroundColor: `${quadrantColors.green.bg}40`,
                tension: 0.4,
            },
            {
                label: '파랑',
                data: lineDataByDay.map(d => d.blue),
                borderColor: quadrantColors.blue.bg,
                backgroundColor: `${quadrantColors.blue.bg}40`,
                tension: 0.4,
            },
        ],
    };

    // AI 피드백 생성
    const generateAiFeedback = async () => {
        const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!key) {
            setShowApiInput(true);
            return;
        }

        if (records.length === 0) {
            setAiFeedback('아직 감정 기록이 없어요. 먼저 감정을 기록해보세요! 😊');
            return;
        }

        setIsAiLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

            // 최근 5개 기록 요약
            const recentRecords = records.slice(0, 5);
            const recordsSummary = recentRecords.map(r => ({
                date: r.date,
                emotions: r.emotions?.map(e => e.korean).join(', ') || '없음',
                event: r.todayEvent?.slice(0, 100) || '없음',
                gratitude: r.gratitude?.slice(0, 50) || '없음',
            }));

            const isAllStudents = isAdmin && viewMode === 'all';

            const prompt = isAllStudents ? `
당신은 따뜻하고 공감 능력이 뛰어난 AI 학교 상담사입니다.
학생들의 전체 감정 기록을 분석하고, 교사에게 인사이트를 제공해주세요.

## 전체 학생 감정 통계:
- 고에너지-불쾌 (빨강): ${quadrantStats.red}회
- 고에너지-유쾌 (노랑): ${quadrantStats.yellow}회
- 저에너지-유쾌 (초록): ${quadrantStats.green}회
- 저에너지-불쾌 (파랑): ${quadrantStats.blue}회
- 총 기록 수: ${records.length}개

## 최근 기록 샘플:
${JSON.stringify(recordsSummary, null, 2)}

## 응답 가이드라인:
1. 한국어로 전문적이지만 따뜻하게 응답해주세요
2. 전체 학생들의 감정 패턴을 분석해주세요
3. 주의가 필요한 패턴이 있다면 알려주세요
4. 교사가 학급 분위기 개선을 위해 할 수 있는 구체적인 조언 1-2개
5. 긍정적인 마무리
6. 이모지를 적절히 사용해주세요
7. 전체 길이는 400자 내외로 작성해주세요

교사를 위한 피드백:` : `
당신은 따뜻하고 공감 능력이 뛰어난 AI 감정 상담사입니다. 
한 학생의 최근 감정 기록을 분석하고, 진심어린 피드백을 제공해주세요.

## 학생의 최근 감정 기록:
${JSON.stringify(recordsSummary, null, 2)}

## 전체 감정 통계:
- 고에너지-불쾌 (빨강): ${quadrantStats.red}회
- 고에너지-유쾌 (노랑): ${quadrantStats.yellow}회
- 저에너지-유쾌 (초록): ${quadrantStats.green}회
- 저에너지-불쾌 (파랑): ${quadrantStats.blue}회

## 응답 가이드라인:
1. 한국어로 따뜻하게 응답해주세요
2. 학생의 감정 패턴을 간단히 분석해주세요
3. 긍정적인 점을 먼저 언급해주세요
4. 힘들어하는 부분이 있다면 공감해주세요
5. 구체적이고 실천 가능한 조언 1-2개를 제안해주세요
6. 격려와 응원의 메시지로 마무리해주세요
7. 이모지를 적절히 사용해주세요
8. 전체 길이는 300자 내외로 작성해주세요

응답:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiFeedback(response.text());
        } catch (error) {
            console.error('AI 피드백 생성 오류:', error);
            setAiFeedback('AI 피드백을 생성하는 중 오류가 발생했어요. API 키를 확인해주세요.');
        } finally {
            setIsAiLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card rounded-3xl p-8 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center animate-slide-up">
                    <div className="text-6xl mb-6">🔐</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        로그인이 필요해요
                    </h1>
                    <LoginButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-md mx-auto space-y-4">
                {/* 헤더 */}
                <div className="glass-card rounded-2xl p-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                {isAdmin && viewMode === 'all' ? '📊 전체 학생 통계' : '📊 감정 통계'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {isAdmin && viewMode === 'all'
                                    ? '학급 전체 감정 패턴을 확인하세요'
                                    : '나의 감정 패턴을 확인해보세요'}
                            </p>
                        </div>
                        {isAdmin && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                👑 교사
                            </span>
                        )}
                    </div>

                    {/* 관리자 전용: 보기 모드 전환 */}
                    {isAdmin && (
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => { setViewMode('my'); setAiFeedback(''); }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'my'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                내 통계
                            </button>
                            <button
                                onClick={() => { setViewMode('all'); setAiFeedback(''); }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                전체 학생 통계
                            </button>
                        </div>
                    )}
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="glass-card rounded-2xl p-4 bg-red-50 border border-red-200">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-500">통계를 불러오는 중...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 text-center animate-slide-up">
                        <div className="text-5xl mb-4">📈</div>
                        <p className="text-gray-600">
                            아직 기록이 없어요.<br />
                            감정을 기록하면 통계를 볼 수 있어요!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* 요약 */}
                        <div className="glass-card rounded-2xl p-4 animate-slide-up">
                            <h2 className="font-bold text-gray-800 mb-3">📋 요약</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-indigo-600">{records.length}</p>
                                    <p className="text-xs text-gray-500">총 기록 수</p>
                                </div>
                                <div className="bg-pink-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-pink-600">{totalEmotions}</p>
                                    <p className="text-xs text-gray-500">총 감정 수</p>
                                </div>
                            </div>
                        </div>

                        {/* 감정 비율 차트 */}
                        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                            <h2 className="font-bold text-gray-800 mb-3">🎨 감정 비율</h2>
                            {totalEmotions > 0 ? (
                                <>
                                    <div className="aspect-square max-w-[200px] mx-auto">
                                        <Doughnut
                                            data={doughnutData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                    {/* 범례 */}
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        {(['red', 'yellow', 'green', 'blue'] as const).map(q => (
                                            <div key={q} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: quadrantColors[q].bg }}
                                                />
                                                <span className="text-xs text-gray-600">
                                                    {q === 'red' && '빨강'}
                                                    {q === 'yellow' && '노랑'}
                                                    {q === 'green' && '초록'}
                                                    {q === 'blue' && '파랑'}
                                                    : {quadrantStats[q]}회 ({totalEmotions > 0 ? Math.round((quadrantStats[q] / totalEmotions) * 100) : 0}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-500 py-4">감정 데이터가 없습니다</p>
                            )}
                        </div>

                        {/* 최근 7일 추이 */}
                        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h2 className="font-bold text-gray-800 mb-3">📈 최근 7일 추이</h2>
                            <div className="h-48">
                                <Line
                                    data={lineData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'bottom',
                                                labels: {
                                                    boxWidth: 12,
                                                    padding: 10,
                                                    font: { size: 10 },
                                                },
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { stepSize: 1 },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        {/* AI 상담사 */}
                        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <h2 className="font-bold text-gray-800 mb-3">
                                {isAdmin && viewMode === 'all' ? '🤖 AI 학급 분석' : '🤖 AI 감정 상담사'}
                            </h2>

                            {/* API 키 입력 */}
                            {showApiInput && (
                                <div className="mb-4 p-3 bg-yellow-50 rounded-xl">
                                    <p className="text-xs text-yellow-700 mb-2">
                                        Gemini API 키가 필요해요. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">여기서 무료로 발급</a>받을 수 있어요!
                                    </p>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="API 키 입력..."
                                        className="w-full px-3 py-2 rounded-lg border border-yellow-200 text-sm"
                                    />
                                </div>
                            )}

                            {aiFeedback ? (
                                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                                        {aiFeedback}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mb-4">
                                    {isAdmin && viewMode === 'all'
                                        ? 'AI가 학급 전체 감정 패턴을 분석하고 인사이트를 제공해드려요.'
                                        : 'AI가 당신의 감정 패턴을 분석하고 맞춤 피드백을 제공해드려요.'}
                                </p>
                            )}

                            <button
                                onClick={generateAiFeedback}
                                disabled={isAiLoading}
                                className="w-full mt-4 py-3 rounded-xl btn-primary font-medium disabled:opacity-50"
                            >
                                {isAiLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        분석 중...
                                    </span>
                                ) : (
                                    '✨ AI 피드백 받기'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
