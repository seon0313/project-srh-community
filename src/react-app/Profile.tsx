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

    const onDelete = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        if (!confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
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
                                        <button onClick={onDelete} disabled={saving} className={`${styles.btn} ${styles.btnDanger}`}>계정 삭제</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={onSave} disabled={saving} className={`${styles.btn} ${styles.btnPrimary}`}>{saving ? "저장 중…" : "저장"}</button>
                                        <button onClick={onCancel} disabled={saving} className={`${styles.btn} ${styles.btnSecondary}`}>취소</button>
                                        <button onClick={onDelete} disabled={saving} className={`${styles.btn} ${styles.btnDanger}`}>계정 삭제</button>
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
        </>
    );
}
export default Profile;