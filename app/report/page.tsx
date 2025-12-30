'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginButton from '@/components/LoginButton';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { quadrantColors } from '@/lib/emotions';

interface EmotionRecord {
    id: string;
    date: string;
    time: string;
    todayEvent: string;
    gratitude: string;
    emotions: {
        id: string;
        korean: string;
        english: string;
        quadrant: 'red' | 'yellow' | 'green' | 'blue';
    }[];
    createdAt: any;
}

export default function ReportPage() {
    const { user, loading } = useAuth();
    const [records, setRecords] = useState<EmotionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');

    useEffect(() => {
        if (!user) return;

        const fetchRecords = async () => {
            setIsLoading(true);
            try {
                const q = query(
                    collection(db, 'emotions'),
                    where('userId', '==', user.uid),
                    limit(100)
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as EmotionRecord[];

                // 날짜순 정렬
                data.sort((a, b) => b.date.localeCompare(a.date));
                setRecords(data);
            } catch (err) {
                console.error('데이터 로딩 오류:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, [user]);

    // 날짜 범위 계산
    const today = new Date();
    const getDateRange = () => {
        if (reportType === 'weekly') {
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return { start: weekAgo, end: today };
        } else {
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return { start: monthAgo, end: today };
        }
    };

    const { start, end } = getDateRange();
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // 해당 기간 기록 필터링
    const periodRecords = records.filter(r => r.date >= startStr && r.date <= endStr);

    // 통계 계산
    const stats = { red: 0, yellow: 0, green: 0, blue: 0 };
    const emotionCounts: { [key: string]: number } = {};

    periodRecords.forEach(record => {
        record.emotions?.forEach(emotion => {
            if (emotion.quadrant) {
                stats[emotion.quadrant]++;
            }
            emotionCounts[emotion.korean] = (emotionCounts[emotion.korean] || 0) + 1;
        });
    });

    const totalEmotions = Object.values(stats).reduce((a, b) => a + b, 0);

    // 가장 많이 느낀 감정 TOP 5
    const topEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // 가장 많은 사분면
    const dominantQuadrant = (Object.keys(stats) as Array<keyof typeof stats>)
        .reduce((a, b) => stats[a] > stats[b] ? a : b);

    const quadrantNames = {
        red: '고에너지-불쾌',
        yellow: '고에너지-유쾌',
        green: '저에너지-유쾌',
        blue: '저에너지-불쾌',
    };

    const quadrantEmojis = {
        red: '😤',
        yellow: '😊',
        green: '😌',
        blue: '😔',
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
        <div className="min-h-screen p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                {/* 헤더 */}
                <div className="glass-card rounded-2xl p-4 animate-fade-in">
                    <h1 className="text-xl font-bold text-gray-800">
                        📊 감정 리포트
                    </h1>
                    <p className="text-sm text-gray-500">
                        {reportType === 'weekly' ? '지난 7일' : '지난 30일'} 동안의 감정 요약
                    </p>

                    {/* 리포트 타입 선택 */}
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => setReportType('weekly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportType === 'weekly'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            주간 리포트
                        </button>
                        <button
                            onClick={() => setReportType('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportType === 'monthly'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            월간 리포트
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-500">리포트 생성 중...</p>
                    </div>
                ) : periodRecords.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 text-center animate-slide-up">
                        <div className="text-5xl mb-4">📝</div>
                        <p className="text-gray-600">
                            이 기간에 기록된 감정이 없어요.<br />
                            감정을 기록하면 리포트를 볼 수 있어요!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* 요약 카드 */}
                        <div className="glass-card rounded-2xl p-4 animate-slide-up">
                            <h2 className="font-bold text-gray-800 mb-3">📋 요약</h2>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-indigo-600">{periodRecords.length}</p>
                                    <p className="text-xs text-gray-500">총 기록</p>
                                </div>
                                <div className="bg-pink-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-pink-600">{totalEmotions}</p>
                                    <p className="text-xs text-gray-500">감정 수</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl">{quadrantEmojis[dominantQuadrant]}</p>
                                    <p className="text-xs text-gray-500">주요 감정</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl" style={{ backgroundColor: `${quadrantColors[dominantQuadrant].bg}20` }}>
                                <p className="text-sm text-gray-700">
                                    이 기간 동안 <strong style={{ color: quadrantColors[dominantQuadrant].bg }}>{quadrantNames[dominantQuadrant]}</strong> 감정이 가장 많았어요.
                                </p>
                            </div>
                        </div>

                        {/* 감정 비율 */}
                        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                            <h2 className="font-bold text-gray-800 mb-3">🎨 감정 비율</h2>

                            <div className="space-y-3">
                                {(['yellow', 'green', 'red', 'blue'] as const).map(q => {
                                    const percentage = totalEmotions > 0 ? Math.round((stats[q] / totalEmotions) * 100) : 0;
                                    return (
                                        <div key={q}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">
                                                    {quadrantEmojis[q]} {quadrantNames[q]}
                                                </span>
                                                <span className="font-medium" style={{ color: quadrantColors[q].bg }}>
                                                    {stats[q]}회 ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: quadrantColors[q].bg,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* TOP 5 감정 */}
                        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h2 className="font-bold text-gray-800 mb-3">🏆 가장 많이 느낀 감정 TOP 5</h2>

                            <div className="space-y-2">
                                {topEmotions.map(([emotion, count], index) => (
                                    <div key={emotion} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1 text-gray-700">{emotion}</span>
                                        <span className="text-sm text-gray-500">{count}회</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 기간 정보 */}
                        <div className="text-center text-xs text-gray-400 py-2">
                            {startStr} ~ {endStr}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
