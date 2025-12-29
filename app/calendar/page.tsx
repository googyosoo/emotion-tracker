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

export default function CalendarPage() {
    const { user, loading, isAdmin } = useAuth();
    const [records, setRecords] = useState<EmotionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
    const [error, setError] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        if (!user) return;

        const fetchRecords = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let q;

                if (isAdmin && viewMode === 'all') {
                    q = query(
                        collection(db, 'emotions'),
                        limit(200)
                    );
                } else {
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
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, [user, isAdmin, viewMode]);

    // 해당 월의 첫째 날과 마지막 날
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = 일요일
    const daysInMonth = lastDayOfMonth.getDate();

    // 달력 그리드 생성 (42칸 = 6주)
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }
    while (calendarDays.length < 42) {
        calendarDays.push(null);
    }

    // 특정 날짜의 감정 기록 가져오기
    const getRecordsForDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return records.filter(r => r.date === dateStr);
    };

    // 특정 날짜의 주요 감정 색상 가져오기
    const getDominantQuadrant = (day: number): 'red' | 'yellow' | 'green' | 'blue' | null => {
        const dayRecords = getRecordsForDate(day);
        if (dayRecords.length === 0) return null;

        const counts = { red: 0, yellow: 0, green: 0, blue: 0 };
        dayRecords.forEach(r => {
            r.emotions?.forEach(e => {
                if (e.quadrant) counts[e.quadrant]++;
            });
        });

        const maxCount = Math.max(...Object.values(counts));
        if (maxCount === 0) return null;

        const dominant = (Object.keys(counts) as Array<keyof typeof counts>).find(k => counts[k] === maxCount);
        return dominant || null;
    };

    // 월 이동
    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    };

    // 선택된 날짜의 기록
    const selectedRecords = selectedDate ? records.filter(r => r.date === selectedDate) : [];

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

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="min-h-screen p-4 pb-24">
            <div className="max-w-md mx-auto space-y-4">
                {/* 헤더 */}
                <div className="glass-card rounded-2xl p-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                📅 감정 캘린더
                            </h1>
                            <p className="text-sm text-gray-500">
                                한 달의 감정을 한눈에 확인하세요
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
                                onClick={() => setViewMode('my')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'my'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                내 기록
                            </button>
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                전체 학생 기록
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

                {/* 캘린더 */}
                <div className="glass-card rounded-2xl p-4 animate-slide-up">
                    {/* 월 네비게이션 */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={goToPrevMonth}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-gray-800">
                                {year}년 {month + 1}월
                            </h2>
                            <button
                                onClick={goToToday}
                                className="text-xs text-indigo-600 hover:underline"
                            >
                                오늘로 이동
                            </button>
                        </div>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day, i) => (
                            <div
                                key={day}
                                className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
                                    }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* 달력 그리드 */}
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, index) => {
                                if (day === null) {
                                    return <div key={`empty-${index}`} className="aspect-square" />;
                                }

                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;
                                const dominantQuadrant = getDominantQuadrant(day);
                                const hasRecords = dominantQuadrant !== null;
                                const dayOfWeek = (startingDayOfWeek + day - 1) % 7;

                                return (
                                    <button
                                        key={`day-${day}`}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`
                                            aspect-square rounded-lg flex flex-col items-center justify-center
                                            transition-all duration-200 relative
                                            ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                                            ${isToday ? 'font-bold' : ''}
                                            ${hasRecords ? 'hover:scale-105' : 'hover:bg-gray-50'}
                                        `}
                                        style={{
                                            backgroundColor: hasRecords && dominantQuadrant
                                                ? `${quadrantColors[dominantQuadrant].bg}30`
                                                : undefined,
                                        }}
                                    >
                                        <span className={`
                                            text-sm
                                            ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                                            ${dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'}
                                        `}>
                                            {day}
                                        </span>
                                        {hasRecords && dominantQuadrant && (
                                            <div
                                                className="w-2 h-2 rounded-full mt-0.5"
                                                style={{ backgroundColor: quadrantColors[dominantQuadrant].bg }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* 범례 */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-3 justify-center">
                            {(['red', 'yellow', 'green', 'blue'] as const).map(q => (
                                <div key={q} className="flex items-center gap-1">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: quadrantColors[q].bg }}
                                    />
                                    <span className="text-xs text-gray-500">
                                        {q === 'red' && '😤'}
                                        {q === 'yellow' && '😊'}
                                        {q === 'green' && '😌'}
                                        {q === 'blue' && '😔'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 선택된 날짜의 기록 */}
                {selectedDate && (
                    <div className="glass-card rounded-2xl p-4 animate-slide-up">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800">
                                📝 {selectedDate.replace(/-/g, '.')} 기록
                            </h3>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {selectedRecords.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                이 날의 기록이 없어요
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {selectedRecords.map((record) => (
                                    <div key={record.id} className="p-3 bg-gray-50 rounded-xl">
                                        {/* 관리자 모드: 학생 정보 */}
                                        {isAdmin && viewMode === 'all' && (
                                            <div className="mb-2 text-xs text-purple-600 font-medium">
                                                👤 {record.userName || '익명'}
                                            </div>
                                        )}

                                        {/* 시간 */}
                                        <div className="text-xs text-gray-400 mb-2">{record.time}</div>

                                        {/* 감정 태그 */}
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

                                        {/* 오늘의 일 */}
                                        <p className="text-gray-700 text-sm line-clamp-2">
                                            {record.todayEvent}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
