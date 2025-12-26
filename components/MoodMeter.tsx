'use client';

import { useState } from 'react';
import {
    Emotion,
    redEmotions,
    yellowEmotions,
    greenEmotions,
    blueEmotions,
    quadrantColors
} from '@/lib/emotions';

interface MoodMeterProps {
    selectedEmotions: Emotion[];
    onSelect: (emotions: Emotion[]) => void;
    maxSelection?: number;
}

export default function MoodMeter({
    selectedEmotions,
    onSelect,
    maxSelection = 2
}: MoodMeterProps) {
    const [activeQuadrant, setActiveQuadrant] = useState<'red' | 'yellow' | 'green' | 'blue' | null>(null);

    const handleEmotionClick = (emotion: Emotion) => {
        const isSelected = selectedEmotions.some(e => e.id === emotion.id);

        if (isSelected) {
            // 선택 해제
            onSelect(selectedEmotions.filter(e => e.id !== emotion.id));
        } else {
            // 선택 추가 (최대 개수 제한)
            if (selectedEmotions.length < maxSelection) {
                onSelect([...selectedEmotions, emotion]);
            } else {
                // 최대 개수면 마지막 것을 교체
                onSelect([...selectedEmotions.slice(0, -1), emotion]);
            }
        }
    };

    const quadrants = [
        { key: 'red' as const, emotions: redEmotions, position: 'top-left' },
        { key: 'yellow' as const, emotions: yellowEmotions, position: 'top-right' },
        { key: 'blue' as const, emotions: blueEmotions, position: 'bottom-left' },
        { key: 'green' as const, emotions: greenEmotions, position: 'bottom-right' },
    ];

    return (
        <div className="space-y-4">
            {/* 선택된 감정 표시 */}
            <div className="flex flex-wrap gap-2 min-h-[44px]">
                {selectedEmotions.length === 0 ? (
                    <p className="text-gray-400 text-sm">감정을 선택해주세요 (최대 {maxSelection}개)</p>
                ) : (
                    selectedEmotions.map((emotion) => (
                        <span
                            key={emotion.id}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium animate-fade-in"
                            style={{
                                backgroundColor: quadrantColors[emotion.quadrant].bg,
                                color: quadrantColors[emotion.quadrant].text
                            }}
                        >
                            {emotion.korean}
                            <button
                                onClick={() => handleEmotionClick(emotion)}
                                className="hover:opacity-70 transition-opacity"
                            >
                                ✕
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* 무드미터 4사분면 그리드 */}
            <div className="grid grid-cols-2 gap-2 aspect-square max-w-md mx-auto">
                {quadrants.map(({ key, emotions }) => (
                    <div key={key} className="relative">
                        {/* 사분면 버튼 */}
                        <button
                            onClick={() => setActiveQuadrant(activeQuadrant === key ? null : key)}
                            className={`w-full aspect-square rounded-2xl transition-all duration-300 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-[1.02] ${activeQuadrant === key ? 'ring-4 ring-white/50 scale-[1.02]' : ''
                                }`}
                            style={{ backgroundColor: quadrantColors[key].bg }}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-1">
                                    {key === 'red' && '😤'}
                                    {key === 'yellow' && '😊'}
                                    {key === 'green' && '😌'}
                                    {key === 'blue' && '😔'}
                                </div>
                                <div className="text-xs opacity-80">
                                    {key === 'red' && '고에너지 · 불쾌'}
                                    {key === 'yellow' && '고에너지 · 유쾌'}
                                    {key === 'green' && '저에너지 · 유쾌'}
                                    {key === 'blue' && '저에너지 · 불쾌'}
                                </div>
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            {/* 선택된 사분면의 감정 목록 */}
            {activeQuadrant && (
                <div
                    className="p-4 rounded-2xl animate-slide-up"
                    style={{ backgroundColor: `${quadrantColors[activeQuadrant].bg}20` }}
                >
                    <h3
                        className="font-bold mb-3"
                        style={{ color: quadrantColors[activeQuadrant].bg }}
                    >
                        {quadrantColors[activeQuadrant].name}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                        {quadrants.find(q => q.key === activeQuadrant)?.emotions.map((emotion) => {
                            const isSelected = selectedEmotions.some(e => e.id === emotion.id);
                            return (
                                <button
                                    key={emotion.id}
                                    onClick={() => handleEmotionClick(emotion)}
                                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isSelected
                                        ? 'ring-2 ring-offset-2 scale-105'
                                        : 'hover:scale-105'
                                        }`}
                                    style={{
                                        backgroundColor: isSelected ? quadrantColors[activeQuadrant].bg : `${quadrantColors[activeQuadrant].bg}40`,
                                        color: isSelected ? quadrantColors[activeQuadrant].text : quadrantColors[activeQuadrant].bg
                                    }}
                                >
                                    {emotion.korean}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 축 레이블 */}
            <div className="flex justify-between text-xs text-gray-400 px-4">
                <span>← 불쾌함</span>
                <span>유쾌함 →</span>
            </div>
        </div>
    );
}
