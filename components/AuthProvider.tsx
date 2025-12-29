'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, browserPopupRedirectResolver } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

// 관리자(교사) 이메일 목록
const ADMIN_EMAILS = [
    'kiparang999@gmail.com',
    'hongjinwoo@simin.hs.kr',
];

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 클라이언트 마운트 확인 (Hydration 에러 방지)
    useEffect(() => {
        setMounted(true);
    }, []);

    // 인증 상태 감지
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            // 관리자 여부 확인
            if (user?.email) {
                setIsAdmin(ADMIN_EMAILS.includes(user.email));
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            // browserPopupRedirectResolver를 명시적으로 사용하여 COOP 문제 완화
            await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
        } catch (error: unknown) {
            // 사용자가 팝업을 닫은 경우는 무시
            if (error && typeof error === 'object' && 'code' in error) {
                const firebaseError = error as { code: string };
                if (firebaseError.code === 'auth/popup-closed-by-user') {
                    console.log('사용자가 로그인 팝업을 닫았습니다.');
                    return;
                }
                // COOP 관련 에러도 무시 (실제 로그인은 성공할 수 있음)
                if (firebaseError.code === 'auth/popup-blocked') {
                    console.warn('팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.');
                    alert('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.');
                    return;
                }
            }
            console.error('로그인 오류:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('로그아웃 오류:', error);
            throw error;
        }
    };

    // 클라이언트 마운트 전에는 로딩 상태 표시 (Hydration 에러 방지)
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card rounded-3xl p-8 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

