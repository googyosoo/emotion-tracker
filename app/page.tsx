'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginButton from '@/components/LoginButton';
import MoodMeter from '@/components/MoodMeter';
import { Emotion, quadrantColors } from '@/lib/emotions';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Home() {
  const { user, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [todayEvent, setTodayEvent] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 클라이언트에서만 날짜/시간 초기값 설정 (hydration 에러 방지)
  useEffect(() => {
    const now = new Date();
    setSelectedDate(now.toISOString().split('T')[0]);
    setSelectedTime(now.toTimeString().slice(0, 5));
  }, []);

  const handleSave = async () => {
    if (!user) return;
    if (!todayEvent.trim()) {
      alert('오늘의 일을 입력해주세요!');
      return;
    }
    if (selectedEmotions.length === 0) {
      alert('감정을 선택해주세요!');
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'emotions'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        date: selectedDate,
        time: selectedTime,
        todayEvent: todayEvent.trim(),
        gratitude: gratitude.trim(),
        emotions: selectedEmotions.map(e => ({
          id: e.id,
          korean: e.korean,
          english: e.english,
          quadrant: e.quadrant,
        })),
        createdAt: serverTimestamp(),
      });

      // 성공 표시
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // 폼 초기화
      setTodayEvent('');
      setGratitude('');
      setSelectedEmotions([]);
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // 로딩 중
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

  // 로그인 필요
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="text-6xl mb-6">🎭</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            감정 기록 앱
          </h1>
          <p className="text-gray-600 mb-8">
            매일 나의 감정을 기록하고<br />
            나를 더 잘 이해해보세요
          </p>
          {/* 로그인 버튼 - 문구 바로 아래 */}
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* 성공 토스트 */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span>✅</span>
            <span className="font-medium">저장되었습니다!</span>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-4">
        {/* 헤더 */}
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">오늘의 감정 기록</h1>
              <p className="text-sm text-gray-500">나의 하루를 기록해보세요</p>
            </div>
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="프로필"
                  className="w-10 h-10 rounded-full border-2 border-indigo-200"
                />
              )}
            </div>
          </div>
        </div>

        {/* 날짜/시간 선택 */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            📅 날짜 & 시간
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">날짜</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">시간</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 오늘의 일 */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            ✍️ 오늘의 일
          </h2>
          <textarea
            value={todayEvent}
            onChange={(e) => setTodayEvent(e.target.value)}
            placeholder="오늘 있었던 일을 자유롭게 적어보세요..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none h-24"
          />
        </div>

        {/* 감사한 일 */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            🙏 오늘의 감사한 일
          </h2>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="오늘 감사했던 일을 적어보세요... (선택)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none h-20"
          />
        </div>

        {/* 무드미터 */}
        <div className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            🎭 오늘의 감정
          </h2>
          <MoodMeter
            selectedEmotions={selectedEmotions}
            onSelect={setSelectedEmotions}
            maxSelection={2}
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-2xl btn-primary font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up flex items-center justify-center gap-2"
          style={{ animationDelay: '0.25s' }}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              💾 저장하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
