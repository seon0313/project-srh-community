import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import styles from "./GuideWrite.module.css";

function GuideWrite() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [step, setStep] = useState(0);
    const [needtime, setNeedtime] = useState(0);
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [saving, setSaving] = useState(false);

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

        setSaving(true);
        try {
            const res = await fetch("/api/guides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    title: title.trim(),
                    description: description.trim(),
                    step,
                    needtime,
                    thumbnail_url: thumbnailUrl.trim(),
                }),
            });

            const data = await res.json();
            
            if (!res.ok || !data.success) {
                alert(data.error || "가이드 생성 중 오류가 발생했습니다.");
                return;
            }

            alert("가이드가 성공적으로 생성되었습니다!");
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
                <div className={styles.card}>
                    <h1 className={styles.title}>가이드 작성</h1>
                    <form onSubmit={handleSubmit}>
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
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="가이드에 대한 간단한 설명을 입력하세요"
                                className={styles.textarea}
                                rows={4}
                                maxLength={500}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label htmlFor="step" className={styles.label}>
                                    단계 수
                                </label>
                                <input
                                    id="step"
                                    type="number"
                                    value={step}
                                    onChange={(e) => setStep(Number(e.target.value))}
                                    placeholder="0"
                                    className={styles.input}
                                    min={0}
                                    max={100}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="needtime" className={styles.label}>
                                    소요 시간 (분)
                                </label>
                                <input
                                    id="needtime"
                                    type="number"
                                    value={needtime}
                                    onChange={(e) => setNeedtime(Number(e.target.value))}
                                    placeholder="0"
                                    className={styles.input}
                                    min={0}
                                    max={10000}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="thumbnail" className={styles.label}>
                                썸네일 URL
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
                                type="submit"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                disabled={saving}
                            >
                                {saving ? "생성 중..." : "가이드 생성"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default GuideWrite;
