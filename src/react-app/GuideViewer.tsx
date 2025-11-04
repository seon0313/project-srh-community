import styles from "./GuideViewer.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import { onImgError, onImgLoad, getSafeImageSrc } from "./utils/imageFallback";

function GuideViewer() {
    const navigate = useNavigate();
    const { id } = useParams();
    const itemId = id || "";

    type GuideItem = {
        id: string;
        parent_id: string;
        title: string;
        author_id: string;
        date: number;
        needtime: number;
        thumbnail_url: string;
        description: string;
        content: string;
    };

    type Guide = {
        id: string;
        title: string;
        description: string;
        author_id: string;
        date: number;
        step: number;
        needtime: number;
        thumbnail_url: string;
    };

    const [item, setItem] = useState<GuideItem | null>(null);
    const [parentGuide, setParentGuide] = useState<Guide | null>(null);
    const [allItems, setAllItems] = useState<GuideItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                setLoading(true);
                setError(null);
                console.log('Loading guide item with ID:', itemId);
                
                // 가이드 아이템 정보 가져오기
                const itemRes = await fetch(`/api/guide-item?id=${itemId}`);
                console.log('Item response status:', itemRes.status);
                
                if (!itemRes.ok) throw new Error("네트워크 오류");
                
                const itemData: GuideItem = await itemRes.json();
                console.log('Item data:', itemData);
                
                if (!active) return;
                setItem(itemData);

                // 부모 가이드 정보 가져오기
                if (itemData.parent_id) {
                    const [guideRes, itemsRes] = await Promise.all([
                        fetch(`/api/guide?id=${itemData.parent_id}`),
                        fetch(`/api/guide-items?id=${itemData.parent_id}`),
                    ]);
                    
                    if (guideRes.ok) {
                        const guideData: Guide = await guideRes.json();
                        if (active) setParentGuide(guideData);
                    }
                    
                    if (itemsRes.ok) {
                        const itemsData: GuideItem[] = await itemsRes.json();
                        if (active) setAllItems(itemsData);
                    }
                }
            } catch (e: any) {
                if (!active) return;
                console.error('Load error:', e);
                setError(e?.message ?? "알 수 없는 오류");
            } finally {
                if (active) setLoading(false);
            }
        }
        
        if (itemId) {
            load();
        } else {
            setError("잘못된 가이드 ID입니다.");
            setLoading(false);
        }
        
        return () => {
            active = false;
        };
    }, [itemId]);

    const currentIndex = allItems.findIndex(it => it.id === itemId);
    const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
    const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingZone}>
                    <div className={styles.spinner} />
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← 뒤로가기
                    </button>
                </div>
                <div className={styles.errorZone}>
                    {error || "가이드를 찾을 수 없습니다."}
                </div>
            </div>
        );
    }

    const markdownComponents: Components = {
        img: ({ node, ...props }) => (
            // Ensure all markdown images also use a fallback on error
            <img 
                {...props} 
                src={getSafeImageSrc(props.src)}
                onError={onImgError}
                onLoad={onImgLoad}
            />
        ),
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    ← 뒤로가기
                </button>
                {parentGuide && (
                    <button 
                        className={styles.guideBtn} 
                        onClick={() => navigate(`/guide/${parentGuide.id}`)}
                    >
                        📚 {parentGuide.title}
                    </button>
                )}
            </div>

            <div className={styles.breadcrumb}>
                {parentGuide && (
                    <>
                        <span 
                            className={styles.breadcrumbLink}
                            onClick={() => navigate(`/guide/${parentGuide.id}`)}
                        >
                            {parentGuide.title}
                        </span>
                        <span className={styles.breadcrumbSep}>/</span>
                    </>
                )}
                <span className={styles.breadcrumbCurrent}>
                    {currentIndex >= 0 ? `${currentIndex + 1}단계` : item.title}
                </span>
            </div>

            <article className={styles.article}>
                <div className={styles.articleHeader}>
                    <img 
                        className={styles.thumbnail} 
                        src={getSafeImageSrc(item.thumbnail_url)}
                        alt={item.title}
                        onError={onImgError}
                        onLoad={onImgLoad}
                    />
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>{item.title}</h1>
                        <div className={styles.meta}>
                            <span className={styles.author}>작성자: {item.author_id}</span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.date}>
                                {new Date(item.date).toLocaleDateString()}
                            </span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.time}>약 {item.needtime}분 소요</span>
                        </div>
                        <p className={styles.description}>{item.description}</p>
                    </div>
                </div>

                <div className={styles.contentSection}>
                    <div className={styles.content}>
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={markdownComponents}
                        >
                            {item.content || item.description}
                        </ReactMarkdown>
                    </div>
                </div>
            </article>

            {(prevItem || nextItem) && (
                <nav className={styles.navigation}>
                    {prevItem ? (
                        <button 
                            className={styles.navBtn}
                            onClick={() => navigate(`/guide/view/${prevItem.id}`)}
                        >
                            <span className={styles.navLabel}>이전 단계</span>
                            <span className={styles.navTitle}>← {prevItem.title}</span>
                        </button>
                    ) : (
                        <div className={styles.navPlaceholder} />
                    )}
                    
                    {nextItem ? (
                        <button 
                            className={styles.navBtn}
                            onClick={() => navigate(`/guide/view/${nextItem.id}`)}
                        >
                            <span className={styles.navLabel}>다음 단계</span>
                            <span className={styles.navTitle}>{nextItem.title} →</span>
                        </button>
                    ) : (
                        <div className={styles.navPlaceholder} />
                    )}
                </nav>
            )}

            {allItems.length > 0 && (
                <aside className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>전체 단계</h3>
                    <ol className={styles.stepList}>
                        {allItems.map((step, idx) => (
                            <li 
                                key={step.id}
                                className={`${styles.stepItem} ${step.id === itemId ? styles.active : ''}`}
                                onClick={() => navigate(`/guide/view/${step.id}`)}
                            >
                                <span className={styles.stepIndex}>{idx + 1}</span>
                                <span className={styles.stepTitle}>{step.title}</span>
                                <span className={styles.stepTime}>{step.needtime}분</span>
                            </li>
                        ))}
                    </ol>
                </aside>
            )}
        </div>
    );
}

export default GuideViewer;
