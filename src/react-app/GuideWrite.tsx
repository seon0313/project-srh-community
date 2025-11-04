import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import styles from "./GuideWrite.module.css";

type GuideItemType = {
    id: string;
    title: string;
    description: string;
    content: string;
    needtime: number;
    thumbnail_url: string;
};

function GuideWrite() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [items, setItems] = useState<GuideItemType[]>([]);
    const [saving, setSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
    const LS_GUIDE_DRAFT_KEY = "guide_draft";

    // 현재 편집 중인 아이템
    const [currentItem, setCurrentItem] = useState<GuideItemType>({
        id: "",
        title: "",
        description: "",
        content: "",
        needtime: 0,
        thumbnail_url: "",
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // textarea 자동 높이 조절
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    // LocalStorage helpers for draft
    const clearDraftLocalStorage = () => {
        try { localStorage.removeItem(LS_GUIDE_DRAFT_KEY); } catch {}
    };
    const saveDraftToLocalStorage = (silent = true) => {
        try {
            const payload = {
                v: 1,
                title,
                description,
                thumbnailUrl,
                items,
                currentItem,
                editingIndex,
                ts: Date.now(),
            };
            localStorage.setItem(LS_GUIDE_DRAFT_KEY, JSON.stringify(payload));
            if (!silent) alert("임시저장 완료 (LocalStorage)");
        } catch (e) {
            console.error("saveDraftToLocalStorage error", e);
            if (!silent) alert("임시저장 중 오류가 발생했습니다.");
        }
    };
    const loadDraftFromLocalStorage = () => {
        try {
            const raw = localStorage.getItem(LS_GUIDE_DRAFT_KEY);
            if (!raw) return false;
            const meta = JSON.parse(raw) as {
                v: number;
                title: string;
                description: string;
                thumbnailUrl: string;
                items: GuideItemType[];
                currentItem: GuideItemType;
                editingIndex: number | null;
                ts?: number;
            };
            setTitle(meta.title || "");
            setDescription(meta.description || "");
            setThumbnailUrl(meta.thumbnailUrl || "");
            setItems(Array.isArray(meta.items) ? meta.items : []);
            if (meta.currentItem && typeof meta.currentItem === 'object') {
                setCurrentItem({
                    id: meta.currentItem.id || "",
                    title: meta.currentItem.title || "",
                    description: meta.currentItem.description || "",
                    content: meta.currentItem.content || "",
                    needtime: Number(meta.currentItem.needtime) || 0,
                    thumbnail_url: meta.currentItem.thumbnail_url || "",
                });
            }
            setEditingIndex(meta.editingIndex ?? null);
            if (meta.ts) setLastSavedAt(meta.ts);
            return true;
        } catch (e) {
            console.error("loadDraftFromLocalStorage error", e);
            return false;
        }
    };

    // Load draft on mount (LocalStorage preferred)
    useEffect(() => {
        const restored = loadDraftFromLocalStorage();
        if (restored) {
            setAutoSaveStatus("saved");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Autosave with debounce
    useEffect(() => {
        const hasAny = title.trim() || description.trim() || thumbnailUrl.trim() || items.length > 0 || currentItem.title.trim() || currentItem.description.trim() || currentItem.content.trim();
        if (!hasAny) return;
        setAutoSaveStatus("saving");
        const t = setTimeout(() => {
            try {
                saveDraftToLocalStorage(true);
                setAutoSaveStatus("saved");
                setLastSavedAt(Date.now());
            } catch (e) {
                setAutoSaveStatus("error");
            }
        }, 1200);
        return () => clearTimeout(t);
    }, [title, description, thumbnailUrl, items, currentItem]);

    const addOrUpdateItem = () => {
        if (!currentItem.title.trim()) {
            alert("단계 제목을 입력해주세요.");
            return;
        }

        if (editingIndex !== null) {
            // 수정 모드
            const newItems = [...items];
            newItems[editingIndex] = currentItem;
            setItems(newItems);
            setEditingIndex(null);
        } else {
            // 추가 모드
            setItems([...items, { ...currentItem, id: crypto.randomUUID() }]);
        }

        // 폼 초기화
        setCurrentItem({
            id: "",
            title: "",
            description: "",
            content: "",
            needtime: 0,
            thumbnail_url: "",
        });
    };

    const editItem = (index: number) => {
        setCurrentItem(items[index]);
        setEditingIndex(index);
    };

    const deleteItem = (index: number) => {
        if (confirm("이 단계를 삭제하시겠습니까?")) {
            setItems(items.filter((_, i) => i !== index));
            if (editingIndex === index) {
                setEditingIndex(null);
                setCurrentItem({
                    id: "",
                    title: "",
                    description: "",
                    content: "",
                    needtime: 0,
                    thumbnail_url: "",
                });
            }
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setCurrentItem({
            id: "",
            title: "",
            description: "",
            content: "",
            needtime: 0,
            thumbnail_url: "",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        if (items.length === 0) {
            alert("최소 1개 이상의 단계를 추가해주세요.");
            return;
        }

        // 총 단계 수와 소요 시간 계산
        const totalSteps = items.length;
        const totalNeedtime = items.reduce((sum, item) => sum + item.needtime, 0);

        setSaving(true);
        try {
            // 1. 가이드 생성
            const guideRes = await fetch("/api/guides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    title: title.trim(),
                    description: description.trim(),
                    step: totalSteps,
                    needtime: totalNeedtime,
                    thumbnail_url: thumbnailUrl.trim(),
                }),
            });

            const guideData = await guideRes.json();
            
            if (!guideRes.ok || !guideData.success) {
                alert(guideData.error || "가이드 생성 중 오류가 발생했습니다.");
                return;
            }

            const guideId = guideData.id;

            // 2. 가이드 아이템들 생성
            for (const item of items) {
                const itemRes = await fetch("/api/guide-items", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token,
                        parent_id: guideId,
                        title: item.title.trim(),
                        description: item.description.trim(),
                        content: item.content.trim(),
                        needtime: item.needtime,
                        thumbnail_url: item.thumbnail_url.trim(),
                    }),
                });

                const itemData = await itemRes.json();
                if (!itemRes.ok || !itemData.success) {
                    console.error("아이템 생성 실패:", itemData.error);
                }
            }

            alert("가이드가 성공적으로 생성되었습니다!");
            // 성공 시 초안 제거
            clearDraftLocalStorage();
            navigate("/guides");
        } catch (error) {
            console.error("가이드 생성 오류:", error);
            alert("가이드 생성 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Topbar />
            <div className={styles.container}>
                <div className={styles.layoutGrid}>
                    {/* 왼쪽: 가이드 기본 정보 */}
                    <div className={styles.leftPanel}>
                        <div className={styles.leftPanelFixed}>
                            <div className={styles.card}>
                                <h1 className={styles.title}>가이드 기본 정보</h1>
                                <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <small style={{ color: '#9aa0a6' }}>
                                        {autoSaveStatus === "saving" && "자동저장 중…"}
                                        {autoSaveStatus === "saved" && lastSavedAt && `자동저장됨 ${new Date(lastSavedAt).toLocaleTimeString()}`}
                                        {autoSaveStatus === "error" && "자동저장 오류"}
                                    </small>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="title" className={styles.label}>
                                        제목 <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="가이드 제목을 입력하세요"
                                        className={styles.input}
                                        maxLength={200}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="description" className={styles.label}>
                                        설명
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => {
                                            setDescription(e.target.value);
                                            autoResize(e);
                                        }}
                                        placeholder="가이드에 대한 간단한 설명을 입력하세요"
                                        className={styles.inputMultiline}
                                        maxLength={500}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="thumbnail" className={styles.label}>
                                        가이드 썸네일 URL
                                    </label>
                                    <input
                                        id="thumbnail"
                                        type="url"
                                        value={thumbnailUrl}
                                        onChange={(e) => setThumbnailUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className={styles.input}
                                    />
                                    {thumbnailUrl && (
                                        <div className={styles.preview}>
                                            <img
                                                src={thumbnailUrl}
                                                alt="썸네일 미리보기"
                                                className={styles.previewImage}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.infoBox}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>총 단계 수:</span>
                                        <span className={styles.infoValue}>{items.length}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>총 소요 시간:</span>
                                        <span className={styles.infoValue}>
                                            {items.reduce((sum, item) => sum + item.needtime, 0)}분
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                        disabled={saving}
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => saveDraftToLocalStorage(false)}
                                        className={`${styles.btn}`}
                                        disabled={saving}
                                    >
                                        임시저장
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { clearDraftLocalStorage(); setAutoSaveStatus('idle'); setLastSavedAt(null); }}
                                        className={`${styles.btn}`}
                                        disabled={saving}
                                    >
                                        초안삭제
                                    </button>
                                    <button
                                        type="submit"
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        disabled={saving || items.length === 0}
                                    >
                                        {saving ? "생성 중..." : "가이드 생성"}
                                    </button>
                                </div>
                            </form>
                        </div>
                        </div>

                        {/* 추가된 단계 목록 */}
                        {items.length > 0 && (
                            <div className={styles.leftPanelScrollable}>
                                <div className={styles.card}>
                                    <h2 className={styles.subtitle}>추가된 단계 ({items.length})</h2>
                                    <div className={styles.itemsList}>
                                    {items.map((item, index) => (
                                        <div key={item.id || index} className={styles.itemCard}>
                                            <div className={styles.itemHeader}>
                                                <span className={styles.itemNumber}>Step {index + 1}</span>
                                                <div className={styles.itemActions}>
                                                    <button
                                                        type="button"
                                                        onClick={() => editItem(index)}
                                                        className={styles.itemBtn}
                                                        title="수정"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteItem(index)}
                                                        className={styles.itemBtn}
                                                        title="삭제"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.itemTitle}>{item.title}</div>
                                            {item.description && (
                                                <div className={styles.itemDesc}>{item.description}</div>
                                            )}
                                            <div className={styles.itemMeta}>
                                                소요시간: {item.needtime}분
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 단계 추가 */}
                    <div className={styles.rightPanel}>
                        <div className={styles.card}>
                            <h2 className={styles.subtitle}>
                                {editingIndex !== null ? `단계 ${editingIndex + 1} 수정` : "새 단계 추가"}
                            </h2>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="itemTitle" className={styles.label}>
                                    단계 제목 <span className={styles.required}>*</span>
                                </label>
                                <input
                                    id="itemTitle"
                                    type="text"
                                    value={currentItem.title}
                                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                                    placeholder="예: 재료 준비하기"
                                    className={styles.input}
                                    maxLength={200}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="itemDescription" className={styles.label}>
                                    단계 설명
                                </label>
                                <textarea
                                    id="itemDescription"
                                    value={currentItem.description}
                                    onChange={(e) => {
                                        setCurrentItem({ ...currentItem, description: e.target.value });
                                        autoResize(e);
                                    }}
                                    placeholder="이 단계에 대한 간단한 설명"
                                    className={styles.inputMultiline}
                                    maxLength={300}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="itemContent" className={styles.label}>
                                    내용 (마크다운)
                                </label>
                                <div data-color-mode="dark">
                                    <MDEditor
                                        value={currentItem.content}
                                        onChange={(val) => setCurrentItem({ ...currentItem, content: val || "" })}
                                        height={360}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="itemNeedtime" className={styles.label}>
                                    소요 시간 (분)
                                </label>
                                <input
                                    id="itemNeedtime"
                                    type="number"
                                    value={currentItem.needtime}
                                    onChange={(e) => setCurrentItem({ ...currentItem, needtime: Number(e.target.value) })}
                                    placeholder="0"
                                    className={styles.input}
                                    min={0}
                                    max={1000}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="itemThumbnail" className={styles.label}>
                                    단계 썸네일 URL
                                </label>
                                <input
                                    id="itemThumbnail"
                                    type="url"
                                    value={currentItem.thumbnail_url}
                                    onChange={(e) => setCurrentItem({ ...currentItem, thumbnail_url: e.target.value })}
                                    placeholder="https://example.com/step-image.jpg"
                                    className={styles.input}
                                />
                                {currentItem.thumbnail_url && (
                                    <div className={styles.preview}>
                                        <img
                                            src={currentItem.thumbnail_url}
                                            alt="단계 썸네일 미리보기"
                                            className={styles.previewImage}
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.itemFormActions}>
                                {editingIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                    >
                                        취소
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={addOrUpdateItem}
                                    className={`${styles.btn} ${styles.btnSuccess}`}
                                >
                                    {editingIndex !== null ? "단계 수정" : "단계 추가"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GuideWrite;
