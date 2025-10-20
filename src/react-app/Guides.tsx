import styles from "./Guides.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Guides() {
    const navigate = useNavigate();

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

    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        let active = true;
        async function loadGuides() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/guides");
                if (!res.ok) throw new Error("네트워크 오류");
                const data: Guide[] = await res.json();
                if (!active) return;
                setGuides(data);
            } catch (e: any) {
                if (!active) return;
                setError(e?.message ?? "알 수 없는 오류");
            } finally {
                if (active) setLoading(false);
            }
        }
        loadGuides();
        return () => {
            active = false;
        };
    }, []);

    const filteredGuides = guides.filter((g) =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    ← 뒤로가기
                </button>
                <h1 className={styles.pageTitle}>전체 가이드</h1>
                <input
                    className={styles.searchBox}
                    type="text"
                    placeholder="가이드 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className={styles.loadingZone}>
                    <div className={styles.spinner}></div>
                </div>
            ) : error ? (
                <div className={styles.errorZone}>{error}</div>
            ) : (
                <>
                    <div className={styles.stats}>
                        총 {filteredGuides.length}개의 가이드
                    </div>
                    <div className={styles.grid}>
                        {filteredGuides.map((guide, index) => (
                            <div
                                key={guide.id}
                                className={styles.card}
                                style={{ "--delay": `${index * 50}ms` } as React.CSSProperties}
                                onClick={() => navigate(`/guide/${guide.id}`)}
                            >
                                <img
                                    className={styles.thumbnail}
                                    src={guide.thumbnail}
                                    alt={guide.title}
                                />
                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{guide.title}</h3>
                                    <p className={styles.cardDescription}>{guide.description}</p>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.author}>{guide.author}</span>
                                        <span className={styles.dot}>•</span>
                                        <span className={styles.time}>{guide.needtime}분</span>
                                        <span className={styles.dot}>•</span>
                                        <span className={styles.steps}>{guide.steps}단계</span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.date}>{guide.date}</span>
                                        <button className={styles.viewBtn}>자세히 보기 →</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredGuides.length === 0 && (
                        <div className={styles.emptyZone}>
                            검색 결과가 없습니다.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Guides;