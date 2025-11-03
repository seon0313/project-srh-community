import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";

import { useEffect, useState } from "react";
import styles from "./Profile.module.css";

type Me = {
    id: string;
    email: string;
    role?: number;
    created_at?: number;
};

function Profile() {
    const navigate = useNavigate();
    const [me, setMe] = useState<Me | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sliderValue, setSliderValue] = useState(0); // 0~100
    const [sliderDone, setSliderDone] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isDraggingThumb, setIsDraggingThumb] = useState(false);

    const loadMe = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/me", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert(data.error || "프로필 정보를 불러오지 못했습니다.");
                return;
            }
            setMe(data.user);
            setEmail(data.user.email || "");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMe(); }, []);

    const onSave = async () => {
        if (!editing) return;
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!email) {
            alert("이메일을 입력하세요.");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password: password || undefined })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert(data.error || "수정 중 오류가 발생했습니다.");
                return;
            }
            alert("프로필이 저장되었습니다.");
            setPassword("");
            await loadMe();
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const onCancel = () => {
        if (!me) return;
        setEmail(me.email || "");
        setPassword("");
        setEditing(false);
    };

    const doDelete = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        setSaving(true);
        try {
            const res = await fetch("/api/me", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert(data.error || "계정 삭제 중 오류가 발생했습니다.");
                return;
            }
            alert("계정이 삭제되었습니다.");
            localStorage.removeItem("token");
            navigate("/");
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
        // reset state for fresh start
        setSliderValue(0);
        setSliderDone(false);
        setConfirmText("");
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleSliderRelease = () => {
        if (sliderValue >= 95) {
            setSliderValue(100);
            setSliderDone(true);
        } else {
            // Step 1 failed: snap back and reset Step 2 input
            setSliderValue(0);
            setSliderDone(false);
            setConfirmText("");
        }
    };

    const isNearThumb = (input: HTMLInputElement, clientX: number) => {
        const rect = input.getBoundingClientRect();
        const trackLeft = rect.left;
        const trackWidth = rect.width;
        const thumbX = trackLeft + (sliderValue / 100) * trackWidth;
        const tolerance = 24; // larger tolerance to match larger thumb for better touch accuracy
        return Math.abs(clientX - thumbX) <= tolerance;
    };

    const onRangeMouseDown: React.MouseEventHandler<HTMLInputElement> = (e) => {
        const target = e.currentTarget;
        if (!isNearThumb(target, e.clientX)) {
            // Block track click jumps; only allow drag starting from thumb
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingThumb(false);
            return;
        }
        setIsDraggingThumb(true);
    };

    const onRangeMouseUp: React.MouseEventHandler<HTMLInputElement> = () => {
        if (isDraggingThumb) {
            handleSliderRelease();
        }
        setIsDraggingThumb(false);
    };

    const onRangeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        if (!isDraggingThumb) {
            // Ignore changes not initiated from the thumb drag
            return;
        }
        setSliderValue(Number(e.target.value));
    };

    const onRangeTouchStart: React.TouchEventHandler<HTMLInputElement> = (e) => {
        const touch = e.touches[0];
        const target = e.currentTarget;
        if (!isNearThumb(target, touch.clientX)) {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingThumb(false);
            return;
        }
        setIsDraggingThumb(true);
    };

    const onRangeTouchEnd: React.TouchEventHandler<HTMLInputElement> = () => {
        if (isDraggingThumb) {
            handleSliderRelease();
        }
        setIsDraggingThumb(false);
    };

    return (
        <>
            <Topbar />
            <div className={styles.container}>
                <div className={`${styles.card} ${editing ? styles.cardEditing : styles.cardView}`}>
                    {editing && <div className={styles.modeBadge}>편집 모드</div>}
                    {loading ? (
                        <div>불러오는 중…</div>
                    ) : me ? (
                        <>
                            {!editing && (
                                <div>
                                    <div className={styles.header}>
                                        <div className={styles.avatar}>{(me.id?.[0] || '?').toUpperCase()}</div>
                                        <div>
                                            <div className={styles.name}>{me.id}</div>
                                            <div className={styles.subtitle}>{email}</div>
                                        </div>
                                    </div>
                                    <div className={styles.metaRow}>
                                        <div className={styles.chip}>권한: {me.role ?? 0}</div>
                                        <div className={styles.chip}>가입일: {me.created_at ? new Date(me.created_at).toLocaleDateString() : '-'}</div>
                                    </div>
                                    <div className={styles.divider} />
                                </div>
                            )}
                            <div className={styles.grid}>
                                {/* 아이디: 편집 모드에서만 표시 */}
                                {editing && (
                                    <div className={styles.row}>
                                        <span className={styles.label}>아이디</span>
                                        <input value={me.id} readOnly className={`${styles.input} ${styles.readonly}`} />
                                    </div>
                                )}

                                {/* 이메일 */}
                                <div className={styles.row}>
                                    <span className={styles.label}>이메일</span>
                                    {!editing ? (
                                        <div className={styles.value}>{email}</div>
                                    ) : (
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
                                    )}
                                </div>

                                {/* 비밀번호 (편집 모드에서만) */}
                                {editing && (
                                    <div className={styles.row}>
                                        <span className={styles.label}>비밀번호 변경 (선택)</span>
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="새 비밀번호 (6자 이상)" className={styles.input} />
                                    </div>
                                )}

                                {/* 기타 정보: 편집 모드에서만 별도 필드로 노출 */}
                                {editing && (
                                    <div className={styles.twoCol}>
                                        <div>
                                            <span className={styles.label}>권한</span>
                                            <div className={styles.pill}>{me.role ?? 0}</div>
                                        </div>
                                        <div>
                                            <span className={styles.label}>가입일</span>
                                            <div className={styles.pill}>{me.created_at ? new Date(me.created_at).toLocaleString() : "-"}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                {!editing ? (
                                    <>
                                        <button onClick={() => setEditing(true)} className={`${styles.btn} ${styles.btnPrimary}`}>편집</button>
                                        <button onClick={openDeleteModal} disabled={saving} className={`${styles.btn} ${styles.btnDanger}`}>계정 삭제</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={onSave} disabled={saving} className={`${styles.btn} ${styles.btnPrimary}`}>{saving ? "저장 중…" : "저장"}</button>
                                        <button onClick={onCancel} disabled={saving} className={`${styles.btn} ${styles.btnSecondary}`}>취소</button>
                                        <button onClick={openDeleteModal} disabled={saving} className={`${styles.btn} ${styles.btnDanger}`}>계정 삭제</button>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div>프로필 정보를 찾을 수 없습니다.</div>
                    )}
                </div>

                <p className={styles.mutedLink}>계정이 없으신가요? <a onClick={() => navigate("/signup")}>회원가입</a></p>
            </div>

            {showDeleteModal && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalTitle}>계정 삭제 확인</div>
                        <div className={styles.modalText}>이 작업은 되돌릴 수 없습니다. 아래 2단계를 순서대로 완료해야 삭제할 수 있습니다.</div>

                        {/* Step 1: Slider */}
                        <div className={styles.modalSection}>
                            <div className={styles.sliderPrompt}>1단계: 왼쪽에서 오른쪽 끝까지 밀어 삭제에 동의하세요.</div>
                            <input
                                className={styles.slider}
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={sliderValue}
                                    onChange={onRangeChange}
                                    onMouseDown={onRangeMouseDown}
                                    onMouseUp={onRangeMouseUp}
                                    onTouchStart={onRangeTouchStart}
                                    onTouchEnd={onRangeTouchEnd}
                                style={{ ['--val' as any]: `${sliderValue}%` }}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={sliderValue}
                            />
                            {!sliderDone && <div className={styles.dangerNote}>끝까지 밀지 않으면 시작 위치로 돌아갑니다.</div>}
                            {sliderDone && <div className={styles.modalText}>확인됨 ✓</div>}
                        </div>

                        {/* Step 2: Exact text input */}
                        {sliderDone && (
                            <div className={styles.modalSection}>
                                <div className={styles.modalText}>2단계: 아래 문구를 정확히 입력하세요.</div>
                                <div className={styles.modalText}><strong>{me?.id} 계정 삭제</strong></div>
                                <div className={`${styles.inputWrap} ${styles.confirmInput}`}>
                                    <input
                                        className={styles.input}
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        aria-label={`${me?.id} 계정 삭제 문구 입력`}
                                    />
                                    <span className={styles.ghostPlaceholder}>{me?.id} 계정 삭제</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeDeleteModal}>취소</button>
                            {sliderDone && confirmText.trim() === `${me?.id} 계정 삭제` && (
                                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={doDelete} disabled={saving}>
                                    {saving ? "삭제 중…" : "계정 삭제"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default Profile;