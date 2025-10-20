import styles from "./Mainmenu.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
    const [loading, setLoading] = useState(true);
    const [guidesLoading, setGuidesLoading] = useState(true);
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
    }, []);

    return (
        <div className={styles.Mainmenu}>
            <Topbar />

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
                    <p>로봇고 프렌즈</p>
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
                    <p>로봇고 프렌즈</p>
                </div>
            </div>
        </div>
    );
}

export default Mainmenu;
