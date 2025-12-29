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

export default function TimelinePage() {
    const { user, loading, isAdmin } = useAuth();
    const [records, setRecords] = useState<EmotionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterQuadrant, setFilterQuadrant] = useState<string>('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterName, setFilterName] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
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
                        limit(100)
                    );
                } else {
                    // 일반 사용자 또는 관리자의 '내 기록' 모드 (단순 쿼리로 변경)
                    q = query(
                        collection(db, 'emotions'),
                        where('userId', '==', user.uid),
                        limit(50)
                    );
                }

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as EmotionRecord[];

                // 날짜순 정렬 (클라이언트에서)
                data.sort((a, b) => {
                    const dateA = `${a.date} ${a.time}`;
                    const dateB = `${b.date} ${b.time}`;
                    return dateB.localeCompare(dateA);
                });

                setRecords(data);
            } catch (err: any) {
                console.error('데이터 로딩 오류:', err);
                // 인덱스 오류 처리
                if (err.code === 'failed-precondition') {
                    setError('Firestore 인덱스가 필요합니다. Firebase Console에서 인덱스를 생성해주세요.');
                } else {
                    setError('데이터를 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecords();
    }, [user, isAdmin, viewMode]);

    // 필터링된 기록
    const filteredRecords = records.filter(record => {
        // 감정 필터
        if (filterQuadrant !== 'all') {
            const hasQuadrant = record.emotions?.some(e => e.quadrant === filterQuadrant);
            if (!hasQuadrant) return false;
        }

        // 날짜 필터
        if (filterStartDate && record.date < filterStartDate) return false;
        if (filterEndDate && record.date > filterEndDate) return false;

        // 관리자 모드: 이름 필터
        if (isAdmin && viewMode === 'all' && filterName) {
            const nameMatch = record.userName?.toLowerCase().includes(filterName.toLowerCase());
            if (!nameMatch) return false;
        }

        // 관리자 모드: 이메일 필터
        if (isAdmin && viewMode === 'all' && filterEmail) {
            const emailMatch = record.userEmail?.toLowerCase().includes(filterEmail.toLowerCase());
            if (!emailMatch) return false;
        }

        return true;
    });

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
                                {isAdmin && viewMode === 'all' ? '📊 전체 학생 기록' : '📖 나의 감정 타임라인'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                총 {filteredRecords.length}개의 기록
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

                {/* 필터 */}
                <div className="glass-card rounded-2xl p-4 animate-slide-up">
                    <h2 className="font-bold text-gray-800 mb-3">🔍 필터</h2>

                    {/* 관리자 전용: 이름/이메일 필터 */}
                    {isAdmin && viewMode === 'all' && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-xl">
                            <label className="text-xs text-purple-600 font-medium block mb-2">👤 학생 검색</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="이름 검색..."
                                        value={filterName}
                                        onChange={(e) => setFilterName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="이메일 검색..."
                                        value={filterEmail}
                                        onChange={(e) => setFilterEmail(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 감정 필터 */}
                    <div className="mb-3">
                        <label className="text-xs text-gray-500 block mb-2">감정 색상</label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setFilterQuadrant('all')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterQuadrant === 'all'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                전체
                            </button>
                            {(['red', 'yellow', 'green', 'blue'] as const).map(q => (
                                <button
                                    key={q}
                                    onClick={() => setFilterQuadrant(q)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterQuadrant === q
                                        ? 'ring-2 ring-offset-2'
                                        : 'hover:opacity-80'
                                        }`}
                                    style={{
                                        backgroundColor: quadrantColors[q].bg,
                                        color: quadrantColors[q].text,
                                    }}
                                >
                                    {q === 'red' && '😤'}
                                    {q === 'yellow' && '😊'}
                                    {q === 'green' && '😌'}
                                    {q === 'blue' && '😔'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 날짜 필터 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">시작일</label>
                            <input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">종료일</label>
                            <input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                            />
                        </div>
                    </div>

                    {/* 필터 초기화 */}
                    {(filterQuadrant !== 'all' || filterStartDate || filterEndDate || filterName || filterEmail) && (
                        <button
                            onClick={() => {
                                setFilterQuadrant('all');
                                setFilterStartDate('');
                                setFilterEndDate('');
                                setFilterName('');
                                setFilterEmail('');
                            }}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            ✕ 필터 초기화
                        </button>
                    )}
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="glass-card rounded-2xl p-4 bg-red-50 border border-red-200">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* 기록 목록 */}
                {isLoading ? (
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-500">기록을 불러오는 중...</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 text-center animate-slide-up">
                        <div className="text-5xl mb-4">📝</div>
                        <p className="text-gray-600">
                            {records.length === 0
                                ? '아직 기록이 없어요.\n첫 번째 감정을 기록해보세요!'
                                : '필터 조건에 맞는 기록이 없어요.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRecords.map((record, index) => (
                            <div
                                key={record.id}
                                className="glass-card rounded-2xl p-4 animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* 관리자 모드: 학생 정보 표시 */}
                                {isAdmin && viewMode === 'all' && (
                                    <div className="mb-2 pb-2 border-b border-gray-100">
                                        <span className="text-xs font-medium text-purple-600">
                                            👤 {record.userName || '익명'} ({record.userEmail || '이메일 없음'})
                                        </span>
                                    </div>
                                )}

                                {/* 날짜/시간 */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-800">
                                        {record.date} {record.time}
                                    </span>
                                    <div className="flex gap-1">
                                        {record.emotions?.map((emotion, idx) => (
                                            <span
                                                key={idx}
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                                style={{
                                                    backgroundColor: quadrantColors[emotion.quadrant].bg,
                                                    color: quadrantColors[emotion.quadrant].text,
                                                }}
                                            >
                                                {emotion.quadrant === 'red' && '😤'}
                                                {emotion.quadrant === 'yellow' && '😊'}
                                                {emotion.quadrant === 'green' && '😌'}
                                                {emotion.quadrant === 'blue' && '😔'}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 감정 태그 */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {record.emotions?.map((emotion, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 rounded-full text-xs font-medium"
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
                                <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                                    {record.todayEvent}
                                </p>

                                {/* 감사한 일 */}
                                {record.gratitude && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">🙏 감사한 일</p>
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {record.gratitude}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
