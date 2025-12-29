'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { quadrantColors } from '@/lib/emotions';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EmotionRecord {
    id: string;
    date: string;
    time: string;
    todayEvent: string;
    gratitude: string;
    userName?: string;
    userEmail?: string;
    userId: string;
    emotions: {
        id: string;
        korean: string;
        english: string;
        quadrant: 'red' | 'yellow' | 'green' | 'blue';
    }[];
    createdAt: any;
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [studentId, setStudentId] = useState<string>('');
    const [records, setRecords] = useState<EmotionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [studentInfo, setStudentInfo] = useState<{ name: string; email: string } | null>(null);

    // params를 unwrap
    useEffect(() => {
        params.then(p => setStudentId(p.id));
    }, [params]);

    useEffect(() => {
        if (!user || !isAdmin || !studentId) return;

        const fetchStudentRecords = async () => {
            setIsLoading(true);
            try {
                const q = query(
                    collection(db, 'emotions'),
                    where('userId', '==', studentId),
                    limit(100)
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as EmotionRecord[];

                // 날짜순 정렬
                data.sort((a, b) => {
                    const dateA = `${a.date} ${a.time}`;
                    const dateB = `${b.date} ${b.time}`;
                    return dateB.localeCompare(dateA);
                });

                setRecords(data);

                // 학생 정보 설정
                if (data.length > 0) {
                    setStudentInfo({
                        name: data[0].userName || '이름 없음',
                        email: data[0].userEmail || '이메일 없음',
                    });
                }
            } catch (err) {
                console.error('학생 데이터 로딩 오류:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentRecords();
    }, [user, isAdmin, studentId]);

    // 감정 통계 계산
    const quadrantStats = { red: 0, yellow: 0, green: 0, blue: 0 };
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
        labels: ['고에너지-불쾌', '고에너지-유쾌', '저에너지-유쾌', '저에너지-불쾌'],
        datasets: [{
            data: [quadrantStats.red, quadrantStats.yellow, quadrantStats.green, quadrantStats.blue],
            backgroundColor: [
                quadrantColors.red.bg,
                quadrantColors.yellow.bg,
                quadrantColors.green.bg,
                quadrantColors.blue.bg,
            ],
            borderWidth: 0,
        }],
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card rounded-3xl p-8 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-6">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        교사만 접근 가능해요
                    </h1>
                    <button
                        onClick={() => router.push('/')}
                        className="btn-primary px-6 py-2 rounded-xl"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                {/* 헤더 */}
                <div className="glass-card rounded-2xl p-4 animate-fade-in">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm">돌아가기</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                            {studentInfo?.name.charAt(0) || '?'}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                {studentInfo?.name}
                            </h1>
                            <p className="text-sm text-gray-500">{studentInfo?.email}</p>
                        </div>
                    </div>
                </div>

                {/* 요약 통계 */}
                <div className="glass-card rounded-2xl p-4 animate-slide-up">
                    <h2 className="font-bold text-gray-800 mb-3">📊 감정 통계</h2>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-indigo-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-indigo-600">{records.length}</p>
                            <p className="text-xs text-gray-500">총 기록 수</p>
                        </div>
                        <div className="bg-pink-50 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-pink-600">{totalEmotions}</p>
                            <p className="text-xs text-gray-500">총 감정 수</p>
                        </div>
                    </div>

                    {totalEmotions > 0 && (
                        <>
                            <div className="aspect-square max-w-[160px] mx-auto">
                                <Doughnut
                                    data={doughnutData}
                                    options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } },
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {(['red', 'yellow', 'green', 'blue'] as const).map(q => (
                                    <div key={q} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: quadrantColors[q].bg }}
                                        />
                                        <span className="text-xs text-gray-600">
                                            {q === 'red' && '😤 빨강'}
                                            {q === 'yellow' && '😊 노랑'}
                                            {q === 'green' && '😌 초록'}
                                            {q === 'blue' && '😔 파랑'}
                                            : {quadrantStats[q]}회
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 최근 기록 */}
                <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="font-bold text-gray-800 mb-3">📝 최근 기록</h2>

                    {records.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">기록이 없습니다</p>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {records.slice(0, 20).map((record) => (
                                <div key={record.id} className="p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-800">
                                            {record.date}
                                        </span>
                                        <span className="text-xs text-gray-400">{record.time}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {record.emotions?.map((emotion, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: `${quadrantColors[emotion.quadrant].bg}20`,
                                                    color: quadrantColors[emotion.quadrant].bg,
                                                }}
                                            >
                                                {emotion.korean}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-gray-700 text-sm line-clamp-2">
                                        {record.todayEvent}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
