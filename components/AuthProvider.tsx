'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
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
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
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

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
