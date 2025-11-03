import styles from "./Guide.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Guide() {
    const navigate = useNavigate();
    const { id } = useParams();
    const guideId = id || "";

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

    type GuideItem = {
        id: string;
        parent_id: string;
        title: string;
        author_id: string;
        content: string;
        date: number;
        needtime: number;
        thumbnail_url: string;
    };

    const [guide, setGuide] = useState<Guide | null>(null);
    const [items, setItems] = useState<GuideItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const [gRes, itemsRes] = await Promise.all([
                    fetch(`/api/guide?id=${guideId}`),
                    fetch(`/api/guide-items?id=${guideId}`),
                ]);
                if (!gRes.ok || !itemsRes.ok) throw new Error("네트워크 오류");
                const guideData: Guide = await gRes.json();
                const allItems: GuideItem[] = await itemsRes.json();
                if (!active) return;
                setGuide(guideData);
                setItems(allItems);
            } catch (e: any) {
                if (!active) return;
                setError(e?.message ?? "알 수 없는 오류");
            } finally {
                if (active) setLoading(false);
            }
        }
        if (guideId) {
            load();
        } else {
            setError("잘못된 가이드 ID입니다.");
            setLoading(false);
        }
        return () => {
            active = false;
        };
    }, [guideId]);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        ← 뒤로가기
                    </button>
                    {guide ? (
                        <div className={styles.headerBody}>
                            <img className={styles.thumb} src={guide.thumbnail_url} alt={guide.title} />
                            <div className={styles.headerContent}>
                                <h1 className={styles.title}>{guide.title}</h1>
                                <p className={styles.description}>{guide.description}</p>
                                <div className={styles.meta}>
                                    <span className={styles.author}>작성자: {guide.author_id}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.date}>{new Date(guide.date).toLocaleDateString()}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.time}>{guide.needtime}분</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.steps}>{guide.step}단계</span>
                                </div>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className={styles.headerBody}>
                            <div className={styles.skeletonThumb} />
                            <div className={styles.skeletonText} />
                        </div>
                    ) : (
                        <div className={styles.headerBody}>
                            <p className={styles.error}>가이드를 찾을 수 없습니다.</p>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className={styles.loadingZone}>
                        <div className={styles.spinner} />
                    </div>
                ) : error ? (
                    <div className={styles.errorZone}>{error}</div>
                ) : (
                    <ol className={styles.stepsList}>
                        {items.map((it, idx) => (
                            <li key={it.id} className={styles.stepCard} style={{ ['--delay' as any]: `${idx * 40}ms` }} onClick={() => navigate("/guide/view/"+it.id)}>
                                <div className={styles.stepHeader}>
                                    <span className={styles.stepIndex}>{idx + 1}</span>
                                    <h3 className={styles.stepTitle}>{it.title}</h3>
                                    <span className={styles.stepTime}>{it.needtime}분</span>
                                </div>
                                <div className={styles.stepBody}>
                                    <img className={styles.stepThumb} src={it.thumbnail_url} alt={it.title} />
                                    <p className={styles.stepContent}>{it.content}</p>
                                </div>
                                <div className={styles.stepMeta}>
                                    <span>작성자: {it.author_id}</span>
                                    <span className={styles.dot}>•</span>
                                    <span>{new Date(it.date).toLocaleDateString()}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </>
    );
}

export default Guide;