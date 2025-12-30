'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { ThemeToggle } from './ThemeProvider';

export default function Navigation() {
    const pathname = usePathname();
    const { user, isAdmin } = useAuth();

    // 로그인하지 않은 경우 네비게이션 숨김
    if (!user) {
        return null;
    }

    const navItems = [
        {
            href: '/',
            label: '기록',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
        },
        {
            href: '/calendar',
            label: '캘린더',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            href: '/timeline',
            label: '타임라인',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            href: '/report',
            label: '리포트',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50">
            <div className="max-w-md mx-auto px-2">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${isActive
                                    ? 'text-indigo-600 bg-indigo-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {item.icon}
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                    <div className="flex flex-col items-center gap-1 px-2 py-2">
                        <ThemeToggle />
                        <span className="text-xs font-medium text-gray-500">테마</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

