import styles from "./Guide.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Guide() {
    const navigate = useNavigate();
    const { id } = useParams();
    const guideId = Number(id);

    type Guide = {
        id: number;
        title: string;
        description: string;
        author: string;
        date: string;
        steps: number;
        needtime: number;
        thumbnail: string;
    };

    type GuideItem = {
        id: number;
        parentId: number;
        title: string;
        author: string;
        content: string;
        date: string;
        needtime: number;
        thumbnail: string;
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
                    fetch("/api/guides"),
                    fetch(`/api/guide-items?id=${guideId}`),
                ]);
                if (!gRes.ok || !itemsRes.ok) throw new Error("네트워크 오류");
                const guides: Guide[] = await gRes.json();
                const allItems: GuideItem[] = await itemsRes.json();
                if (!active) return;
                const found = guides.find((g) => g.id === guideId) ?? null;
                setGuide(found);
                setItems(allItems);
            } catch (e: any) {
                if (!active) return;
                setError(e?.message ?? "알 수 없는 오류");
            } finally {
                if (active) setLoading(false);
            }
        }
        if (!Number.isNaN(guideId)) {
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
                            <img className={styles.thumb} src={guide.thumbnail} alt={guide.title} />
                            <div className={styles.headerContent}>
                                <h1 className={styles.title}>{guide.title}</h1>
                                <div className={styles.meta}>
                                    <span className={styles.author}>{guide.author}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.date}>{guide.date}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.time}>{guide.needtime}분</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.steps}>{guide.steps}단계</span>
                                </div>
                                <p className={styles.description}>{guide.description}</p>
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
                            <li key={it.id} className={styles.stepCard} style={{ ['--delay' as any]: `${idx * 40}ms` }}>
                                <div className={styles.stepHeader}>
                                    <span className={styles.stepIndex}>{idx + 1}</span>
                                    <h3 className={styles.stepTitle}>{it.title}</h3>
                                    <span className={styles.stepTime}>{it.needtime}분</span>
                                </div>
                                <div className={styles.stepBody}>
                                    <img className={styles.stepThumb} src={it.thumbnail} alt={it.title} />
                                    <p className={styles.stepContent}>{it.content}</p>
                                </div>
                                <div className={styles.stepMeta}>
                                    <span>{it.author}</span>
                                    <span className={styles.dot}>•</span>
                                    <span>{it.date}</span>
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