import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Manager.module.css';
import Topbar from './Topbar';

function Manager() {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const actions = [
        {
            id: 'write-guide',
            title: '가이드 글쓰기',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
                    <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor" />
                </svg>
            ),
            description: '새로운 가이드를 등록하고 커뮤니티와 공유합니다.',
            onClick: () => navigate('/guide/write'),
            requiresAuth: true,
        },
        {
            id: 'manage-guides',
            title: '작성한 가이드',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                </svg>
            ),
            description: '내가 작성한 가이드를 관리합니다.',
            onClick: () => alert('작성한 가이드 관리'),
            requiresAuth: true,
        },
        {
            id: 'write-post',
            title: '게시글 쓰기',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zM7 9h14V7H7v2zm0 4h10v-2H7v2z" fill="currentColor" />
                    <path d="M21 3H3v14h18V3z" fill="currentColor" opacity="0.15" />
                </svg>
            ),
            description: '일반 게시글을 작성합니다.',
            onClick: () => navigate('/manager/post/write'),
            requiresAuth: false,
        },
        {
            id: 'manage-posts',
            title: '작성한 게시글',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" />
                </svg>
            ),
            description: '내가 작성한 게시글을 관리합니다.',
            onClick: () => alert('작성한 게시글 관리'),
            requiresAuth: true,
        },
        {
            id: 'register-banner',
            title: '배너 등록하기',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M4 4h16v6H4z" fill="currentColor" />
                    <path d="M4 14h10v6H4z" fill="currentColor" opacity="0.9" />
                </svg>
            ),
            description: '상단 또는 사이드 배너를 등록합니다.',
            onClick: () => alert('배너 등록하기'),
            requiresAuth: true,
        },
        {
            id: 'manage-banners',
            title: '배너 관리',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 3h18v8H3V3zm0 10h12v8H3v-8zm14 0h4v8h-4v-8z" fill="currentColor" opacity="0.8" />
                </svg>
            ),
            description: '등록된 배너를 관리합니다.',
            onClick: () => alert('배너 관리'),
            requiresAuth: true,
        },
    ];

    return (
        <>
            <Topbar />
            <div className={styles.managerContainer}>
                <div className={styles.grid}>
                    {actions.map((action) => {
                        const isDisabled = action.requiresAuth && !isLoggedIn;
                        return (
                            <button
                                key={action.id}
                                className={`${styles.actionButton} ${isDisabled ? styles.disabled : ''}`}
                                onClick={isDisabled ? () => alert('로그인이 필요합니다.') : action.onClick}
                                disabled={isDisabled}
                                aria-label={action.title}
                                title={action.title}
                            >
                                <div className={styles.actionIcon}>{action.icon}</div>
                                <div className={styles.actionTitle}>{action.title}</div>
                                {action.description && (
                                    <div className={styles.actionSubtitle}>{action.description}</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {modalOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <header className={styles.modalHeader}>
                            <h2>전체 가이드</h2>
                            <button className={styles.modalClose} onClick={() => setModalOpen(false)} aria-label="닫기">✕</button>
                        </header>
                        <div className={styles.modalBody}>
                            <p>여기에 전체 가이드를 불러오거나 요약된 목록을 표시할 수 있습니다.</p>
                            <ul>
                                <li>가이드 1 — 빠른 시작</li>
                                <li>가이드 2 — 고급 사용법</li>
                                <li>가이드 3 — 팁과 트릭</li>
                            </ul>
                        </div>
                        <footer className={styles.modalFooter}>
                            <button onClick={() => setModalOpen(false)} className={styles.modalAction}>닫기</button>
                        </footer>
                    </div>
                </div>
            )}
            
        </>
    );
};

export default Manager;