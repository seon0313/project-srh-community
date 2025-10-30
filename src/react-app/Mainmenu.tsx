import styles from "./Mainmenu.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Topbar from "./Topbar";

function Mainmenu() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<{ id: number; title: string; author: string; date: string }[]>([]);
    const [guides, setGuides] = useState<{ 
        id: number; 
        title: string; 
        description: string; 
        author: string; 
        needtime: number; 
        thumbnail: string 
    }[]>([]);
    const [users, setUsers] = useState<{
        id: number;
        username: string;
        displayName: string;
        company?: string;
        position?: string;
        bio?: string;
        avatar: string;
        isOnline: boolean;
        badges: string[];
    }[]>([]);
    const [banners, setBanners] = useState<string[]>([]);
    const [loadedBanners, setLoadedBanners] = useState<Record<string, boolean>>({});
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const pausedRef = useRef(false);
    const offsetRef = useRef<number>(0);
    const initializedRef = useRef(false);
    const isAnimatingRef = useRef(false);
    const pausedMonitorRef = useRef<number | null>(null);
    const scrollOnceRef = useRef<() => void>(() => {});
    const resumeTimerRef = useRef<number | null>(null);

    const startPausedMonitor = () => {
        if (pausedMonitorRef.current != null) return;
        const loop = () => {
            const slider = sliderRef.current;
            if (!slider) return;
            const container = slider.parentElement as HTMLElement | null;
            const firstEl = slider.firstElementChild as HTMLElement | null;
            if (container && firstEl) {
                // don't mutate DOM while a centering animation is in progress
                if (isAnimatingRef.current) {
                    pausedMonitorRef.current = window.requestAnimationFrame(loop);
                    return;
                }
                const containerRect = container.getBoundingClientRect();
                const firstRect = firstEl.getBoundingClientRect();
                // if first element is fully out to the left, append it
                if (firstRect.right <= containerRect.left + 1) {
                    // compute gap and slideStep
                    let gap = 0;
                    if (slider.children.length > 1) {
                        const second = slider.children[1] as HTMLElement;
                        gap = second.offsetLeft - (firstEl.offsetLeft + firstEl.offsetWidth);
                        if (!isFinite(gap) || gap < 0) gap = 0;
                    }
                    const slideStep = firstEl.offsetWidth + gap;
                    // append and adjust offset
                    slider.appendChild(firstEl);
                    offsetRef.current = offsetRef.current + slideStep;
                    slider.style.transition = 'none';
                    void slider.offsetHeight;
                    slider.style.transform = `translateX(${offsetRef.current}px)`;
                    // rotate state to keep React in sync
                    setBanners(prev => {
                        if (prev.length === 0) return prev;
                        const [first, ...rest] = prev;
                        return [...rest, first];
                    });
                }
            }

            pausedMonitorRef.current = window.requestAnimationFrame(loop);
        };
        pausedMonitorRef.current = window.requestAnimationFrame(loop);
    };

    const stopPausedMonitor = () => {
        if (pausedMonitorRef.current != null) {
            window.cancelAnimationFrame(pausedMonitorRef.current);
            pausedMonitorRef.current = null;
        }
    };

    // Center a slide by index with animation; accepts optional onComplete callback
    const centerChildAtIndex = (index: number, onComplete?: () => void) => {
        const slider = sliderRef.current;
        if (!slider) return;
        const child = slider.children[index] as HTMLElement | undefined;
        if (!child) return;
        const container = slider.parentElement as HTMLElement;
        if (!container) return;

    const slideWidth = child.offsetWidth;
    const childOffsetLeft = child.offsetLeft; // relative to slider
    const newOffset = (container.clientWidth - slideWidth) / 2 - childOffsetLeft;

        // Animate to the new offset
        slider.style.transition = 'transform 400ms ease';
        offsetRef.current = newOffset;
        isAnimatingRef.current = true;
        slider.style.transform = `translateX(${newOffset}px)`;

        const onEnd = () => {
            slider.removeEventListener('transitionend', onEnd);
            // keep isAnimating false so interval can continue
            isAnimatingRef.current = false;
            if (onComplete) onComplete();
        };
        slider.addEventListener('transitionend', onEnd);
    };
    const [loading, setLoading] = useState(true);
    const [guidesLoading, setGuidesLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [bannersLoading, setBannersLoading] = useState(true);
    const [isFriendsOpen, setFriendsOpen] = useState(false);

    useEffect(() => {
        fetch("/api/posts")
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        fetch("/api/guides")
            .then(res => res.json())
            .then(data => {
                setGuides(data);
                setGuidesLoading(false);
            })
            .catch(() => setGuidesLoading(false));

        fetch("/api/users")
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setUsersLoading(false);
            })
            .catch(() => setUsersLoading(false));

        fetch("/api/banners?count=10")
            .then(res => res.json())
            .then(data => {
                setBanners(data.banners);
                setBannersLoading(false);
            })
            .catch(() => setBannersLoading(false));
    }, []);

    // 배너 슬라이드 로직 (JS로 한 개씩 스크롤, 화면 밖으로 나간 아이템은 배열 맨 뒤로 이동)
    useEffect(() => {
        if (banners.length === 0) return;

    // isAnimatingRef used so other handlers (hover centering) can coordinate animation state
    isAnimatingRef.current = isAnimatingRef.current || false;

        // 초기 중앙 정렬 (컴포넌트가 처음 셋업될 때만 수행)
            if (!initializedRef.current) {
            const sliderEl = sliderRef.current!;
            const firstChildInit = sliderEl.children[0] as HTMLElement | undefined;
            let centerOffset = 0;
            if (firstChildInit) {
                const slideWidth = firstChildInit.offsetWidth;
                const container = sliderEl.parentElement as HTMLElement;
                centerOffset = (container.clientWidth - slideWidth) / 2;
                sliderEl.style.transition = 'none';
                sliderEl.style.transform = `translateX(${centerOffset}px)`;
            }
            offsetRef.current = centerOffset;
            initializedRef.current = true;
        }

        const handleResize = () => {
            const slider = sliderRef.current;
            if (!slider) return;
            const container = slider.parentElement as HTMLElement;
            if (!container) return;

            // Determine which child is visually closest to the container center
            const containerRect = container.getBoundingClientRect();
            const containerCenterX = containerRect.left + container.clientWidth / 2;

            let closestChild: HTMLElement | null = null;
            let closestDist = Infinity;
            for (let i = 0; i < slider.children.length; i++) {
                const child = slider.children[i] as HTMLElement;
                const rect = child.getBoundingClientRect();
                const childCenter = rect.left + rect.width / 2;
                const dist = Math.abs(childCenter - containerCenterX);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestChild = child;
                }
            }

            if (!closestChild) return;

            // Compute the new offset so that the closestChild stays centered
            const slideWidth = closestChild.offsetWidth;
            const childOffsetLeft = closestChild.offsetLeft; // relative to slider
            const newOffset = (container.clientWidth - slideWidth) / 2 - childOffsetLeft;

            offsetRef.current = newOffset;
            slider.style.transition = 'none';
            // Apply transform immediately and force reflow to avoid visual jumps
            slider.style.transform = `translateX(${newOffset}px)`;
            void slider.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

    const scrollOnce = () => {
            if (pausedRef.current) return; // 일시정지 상태면 동작 금지
            if (!sliderRef.current || isAnimatingRef.current) return;
            const slider = sliderRef.current;
            const firstChild = slider.children[0] as HTMLElement | undefined;
            if (!firstChild) return;

            // compute gap between first two children (if present) because CSS gap is used
            let gap = 0;
            if (slider.children.length > 1) {
                const second = slider.children[1] as HTMLElement;
                gap = second.offsetLeft - (firstChild.offsetLeft + firstChild.offsetWidth);
                if (!isFinite(gap) || gap < 0) gap = 0;
            }

            const slideWidth = firstChild.offsetWidth; // 픽셀 단위로 이동 (content width)
            const slideStep = slideWidth + gap; // include gap so transform matches visual movement
            isAnimatingRef.current = true;

            // 애니메이션으로 왼쪽으로 한 칸 이동 (현재 offset에서 slideWidth만큼 왼쪽)
            slider.style.transition = 'transform 600ms ease';
            offsetRef.current = offsetRef.current - slideStep;
            slider.style.transform = `translateX(${offsetRef.current}px)`;

            const onTransitionEnd = () => {
                slider.removeEventListener('transitionend', onTransitionEnd);
                // DOM 순서 변경은 요소가 완전히 컨테이너 밖으로 나간 경우에만 수행
                const container = slider.parentElement as HTMLElement;
                const firstEl = slider.firstElementChild as HTMLElement | null;
                const containerRect = container.getBoundingClientRect();
                const firstRect = firstEl ? firstEl.getBoundingClientRect() : null;
                const fullyOut = firstRect ? (firstRect.right <= containerRect.left + 1) : false;

                if (fullyOut && firstEl) {
                    // 요소가 완전히 나갔을 때만 끝으로 옮기고 offset을 복원
                    slider.appendChild(firstEl);
                    // offset을 한 칸 오른쪽으로 되돌려 중앙 기준 유지 (include gap)
                    offsetRef.current = offsetRef.current + slideStep;

                    // transition 제거하고 즉시 위치 복원
                    slider.style.transition = 'none';
                    void slider.offsetHeight;
                    slider.style.transform = `translateX(${offsetRef.current}px)`;

                    // 상태도 배열 회전으로 동기화 (다음 프레임에 수행)
                    requestAnimationFrame(() => {
                        setBanners(prev => {
                            if (prev.length === 0) return prev;
                            const [first, ...rest] = prev;
                            return [...rest, first];
                        });
                        requestAnimationFrame(() => { isAnimatingRef.current = false; });
                    });
                } else {
                    // 아직 완전히 나가지 않았으면 단순히 애니메이션 플래그 해제 (다음 간격에 다시 이동)
                    slider.style.transition = 'none';
                    void slider.offsetHeight;
                    slider.style.transform = `translateX(${offsetRef.current}px)`;
                    requestAnimationFrame(() => { isAnimatingRef.current = false; });
                }
            };

            slider.addEventListener('transitionend', onTransitionEnd);
        };

    // expose scrollOnce so handlers outside the effect can trigger a single step
    scrollOnceRef.current = scrollOnce;

        const interval = setInterval(scrollOnce, 1200);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
            // clear any pending resume timer
            if (resumeTimerRef.current != null) { window.clearTimeout(resumeTimerRef.current); resumeTimerRef.current = null; }
            // stop paused monitor if running
            stopPausedMonitor();
        };
    }, [banners]);

    return (
        <div className={styles.Mainmenu}>
            <Topbar />

            {/* 배너 슬라이더 */}
            {!bannersLoading && banners.length > 0 ? (
                <div className={styles.bannerContainer} tabIndex={0}>
                    <div className={styles.bannerSlider} ref={sliderRef}>
                        {banners.map((banner, index) => (
                            <div key={banner} className={styles.bannerItem}>
                                <img
                                    key={banner}
                                    src={banner}
                                    className={styles.bannerImage}
                                    tabIndex={0}
                                    onMouseEnter={() => { 
                                        // cancel pending resume timer
                                        if (resumeTimerRef.current != null) { window.clearTimeout(resumeTimerRef.current); resumeTimerRef.current = null; }
                                        pausedRef.current = true; 
                                        // allow scaled image to overflow the container while hovered
                                        const container = sliderRef.current?.parentElement as HTMLElement | null;
                                        if (container) container.style.overflow = 'visible';
                                        centerChildAtIndex(index, () => startPausedMonitor()); 
                                    }}
                                    onMouseLeave={() => { 
                                        // schedule a guaranteed resume+step after 1s
                                        if (resumeTimerRef.current != null) { window.clearTimeout(resumeTimerRef.current); }
                                        pausedRef.current = false; 
                                        stopPausedMonitor(); 
                                        const container = sliderRef.current?.parentElement as HTMLElement | null;
                                        if (container) container.style.overflow = '';
                                        resumeTimerRef.current = window.setTimeout(() => {
                                            resumeTimerRef.current = null;
                                            pausedRef.current = false;
                                            stopPausedMonitor();
                                            try { scrollOnceRef.current(); } catch (e) { /* ignore */ }
                                        }, 1000);
                                    }}
                                    onFocus={() => { 
                                        if (resumeTimerRef.current != null) { window.clearTimeout(resumeTimerRef.current); resumeTimerRef.current = null; }
                                        pausedRef.current = true; 
                                        const container = sliderRef.current?.parentElement as HTMLElement | null;
                                        if (container) container.style.overflow = 'visible';
                                        centerChildAtIndex(index, () => startPausedMonitor()); 
                                    }}
                                    onBlur={() => { 
                                        if (resumeTimerRef.current != null) { window.clearTimeout(resumeTimerRef.current); }
                                        pausedRef.current = false; 
                                        stopPausedMonitor(); 
                                        const container = sliderRef.current?.parentElement as HTMLElement | null;
                                        if (container) container.style.overflow = '';
                                        resumeTimerRef.current = window.setTimeout(() => {
                                            resumeTimerRef.current = null;
                                            pausedRef.current = false;
                                            stopPausedMonitor();
                                            try { scrollOnceRef.current(); } catch (e) { /* ignore */ }
                                        }, 1000);
                                    }}
                                    onLoad={() => setLoadedBanners(prev => ({ ...prev, [banner]: true }))}
                                    onError={() => setLoadedBanners(prev => ({ ...prev, [banner]: true }))}
                                />
                                {!loadedBanners[banner] && (
                                    <div className={styles.bannerSpinnerOverlay}>
                                        <div className={styles.loadingSpinner}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Show loading placeholder while banners are loading
                <div className={styles.bannerContainer}>
                    <div className={styles.bannerLoading}>
                        <div className={styles.loadingSpinner}></div>
                    </div>
                </div>
            )}

            {/* 모바일 전용 프렌즈 토글 버튼 */}
            <button
                type="button"
                className={styles.friendsToggleButton}
                aria-controls="friends-drawer"
                aria-expanded={isFriendsOpen}
                onClick={() => setFriendsOpen((v) => !v)}
            >
                프렌즈 열기
            </button>

            {/* 프렌즈 슬라이드 드로어 및 오버레이 */}
            <div
                className={`${styles.drawerOverlay} ${isFriendsOpen ? styles.open : ""}`}
                onClick={() => setFriendsOpen(false)}
                aria-hidden={!isFriendsOpen}
            />
            <aside
                id="friends-drawer"
                className={`${styles.friendsDrawer} ${isFriendsOpen ? styles.open : ""}`}
                role="dialog"
                aria-label="또봇고 프렌즈"
            >
                <div className={styles.friendsDrawerHeader}>
                    <strong>또봇고 프렌즈</strong>
                    <button type="button" className={styles.closeButton} onClick={() => setFriendsOpen(false)} aria-label="닫기">×</button>
                </div>
                <div className={styles.friendsDrawerBody}>
                    {usersLoading ? (
                        <div className={styles.loadingSpinner}></div>
                    ) : (
                        <div className={styles.businessCardList}>
                            {users.slice(0, 8).map((user, index) => (
                                <div 
                                    key={user.id} 
                                    className={styles.businessCard}
                                    style={{ '--item-index': index } as React.CSSProperties}
                                    onClick={() => navigate("/user/" + user.username)}
                                >
                                    <div className={styles.cardHeader}>
                                        <img 
                                            src={user.avatar} 
                                            alt={user.displayName} 
                                            className={styles.cardAvatar}
                                        />
                                        <div className={styles.cardInfo}>
                                            <h4 className={styles.cardName}>{user.displayName}</h4>
                                            <p className={styles.cardPosition}>{user.position}</p>
                                            <p className={styles.cardCompany}>{user.company}</p>
                                        </div>
                                        <div className={`${styles.onlineStatus} ${user.isOnline ? styles.online : styles.offline}`}></div>
                                    </div>
                                    <div className={styles.cardBadges}>
                                        {user.badges.slice(0, 2).map((badge, i) => (
                                            <span key={i} className={styles.badge}>{badge}</span>
                                        ))}
                                    </div>
                                    <p className={styles.cardBio}>{user.bio?.slice(0, 60)}...</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            <div className={styles.main}>
                <div className={`${styles.mainItem} ${styles.infoPanel}`}>
                    {guidesLoading ? (
                        <div className={styles.guideLoadingSpace}>
                            <div className={styles.loadingSpinner}></div>
                        </div>
                    ) : (
                        <div className={styles.guideList}>
                            {guides.slice(0, 5).map((guide, index) => (
                                <div 
                                    key={guide.id} 
                                    className={styles.guideItem}
                                    style={{ '--item-index': index } as React.CSSProperties}
                                    onClick={() => navigate("/guide/" + guide.id)}
                                >
                                    <img 
                                        src={guide.thumbnail} 
                                        alt={guide.title} 
                                        className={styles.guideThumbnail}
                                    />
                                    <div className={styles.guideContent}>
                                        <h4 className={styles.guideTitle}>{guide.title}</h4>
                                        <p className={styles.guideDescription}>{guide.description}</p>
                                        <div className={styles.guideMeta}>
                                            <span className={styles.guideAuthor}>{guide.author}</span>
                                            <span className={styles.guideTime}>{guide.needtime}분</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className={styles.moreButtonContainer}>
                                <div className={styles.moreButton} onClick={() => navigate("/guides")}>
                                    <p>더보기</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={`${styles.mainItem} ${styles.contentPanel}`}>
                    <table className={styles.posttable}>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className={styles.loadingSpace}>
                                        <div className={styles.loadingSpinner}></div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {posts.map((post, index) => (
                                        <tr
                                            key={post.id}
                                            className={styles.postitem}
                                            style={{ '--item-index': index } as React.CSSProperties}
                                        >
                                            <td
                                                className={styles.postTitle}
                                                onClick={() => navigate("/post/" + post.id)}
                                            >
                                                <strong>{post.title}</strong>
                                            </td>
                                            <td
                                                className={styles.postAuthor}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate("/user/" + post.author);
                                                }}
                                            >
                                                <strong>{post.author}</strong>
                                            </td>
                                            <td
                                                className={styles.postDate}
                                                onClick={() => navigate("/post/" + post.id)}
                                            >
                                                <strong>{post.date}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )}
                            <tr className={styles.moreButtonContainer}>
                                <td colSpan={3} className={styles.moreButton} onClick={() => navigate("/posts")}>
                                    <p>더보기</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className={`${styles.mainItem} ${styles.friendsPanel}`}>
                    {usersLoading ? (
                        <div className={styles.guideLoadingSpace}>
                            <div className={styles.loadingSpinner}></div>
                        </div>
                    ) : (
                        <div className={styles.businessCardList}>
                            {users.slice(0, 6).map((user, index) => (
                                <div 
                                    key={user.id} 
                                    className={styles.businessCard}
                                    style={{ '--item-index': index } as React.CSSProperties}
                                    onClick={() => navigate("/user/" + user.username)}
                                >
                                    <div className={styles.cardHeader}>
                                        <img 
                                            src={user.avatar} 
                                            alt={user.displayName} 
                                            className={styles.cardAvatar}
                                        />
                                        <div className={styles.cardInfo}>
                                            <h4 className={styles.cardName}>{user.displayName}</h4>
                                            <p className={styles.cardPosition}>{user.position}</p>
                                            <p className={styles.cardCompany}>{user.company}</p>
                                        </div>
                                        <div className={`${styles.onlineStatus} ${user.isOnline ? styles.online : styles.offline}`}></div>
                                    </div>
                                    <div className={styles.cardBadges}>
                                        {user.badges.slice(0, 2).map((badge, i) => (
                                            <span key={i} className={styles.badge}>{badge}</span>
                                        ))}
                                    </div>
                                    <p className={styles.cardBio}>{user.bio?.slice(0, 60)}...</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Mainmenu;
