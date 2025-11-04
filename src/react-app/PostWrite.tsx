import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import styles from "./PostWrite.module.css";

function PostWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState<string>("## 새 게시글\n여기에 내용을 입력하세요.");
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Cookie helpers (read/clear only for migration)
  const getCookie = (name: string): string | null => {
    const decoded = decodeURIComponent(document.cookie);
    const parts = decoded.split(";").map((c) => c.trim());
    const prefix = encodeURIComponent(name) + "=";
    for (const part of parts) {
      if (part.startsWith(prefix)) {
        return part.substring(prefix.length);
      }
    }
    return null;
  };
  const deleteCookie = (name: string) => {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const DRAFT_META = "draft_post_meta";
  const DRAFT_CONTENT_PREFIX = "draft_post_content_"; // + index starting at 1
  const LS_DRAFT_KEY = "post_draft";

  const clearDraftCookies = () => {
    // remove meta
    deleteCookie(DRAFT_META);
    // remove content chunks up to a reasonable max
    for (let i = 1; i <= 20; i++) {
      const key = `${DRAFT_CONTENT_PREFIX}${i}`;
      if (!getCookie(key)) break;
      deleteCookie(key);
    }
  };

  // Note: Cookie writing is deprecated. We keep only load & clear for migration.

  const loadDraftFromCookies = () => {
    const metaRaw = getCookie(DRAFT_META);
    if (!metaRaw) return false;
    try {
      const meta = JSON.parse(metaRaw) as {
        v: number;
        title: string;
        tags: string;
        thumbnailUrl: string;
        chunks: number;
        ts: number;
      };
      const parts: string[] = [];
      const count = Math.min(Math.max(meta.chunks || 0, 0), 20);
      for (let i = 1; i <= count; i++) {
        const part = getCookie(`${DRAFT_CONTENT_PREFIX}${i}`) || "";
        parts.push(part);
      }
      setTitle(meta.title || "");
      setTags(meta.tags || "");
      setThumbnailUrl(meta.thumbnailUrl || "");
      setContent(parts.join(""));
      return true;
    } catch (e) {
      console.error("loadDraftFromCookies error", e);
      return false;
    }
  };

  // LocalStorage helpers (preferred)
  const clearDraftLocalStorage = () => {
    try { localStorage.removeItem(LS_DRAFT_KEY); } catch {}
  };
  const saveDraftToLocalStorage = (silent = false) => {
    try {
      const payload = {
        v: 1,
        title,
        tags,
        thumbnailUrl,
        content: content || "",
        ts: Date.now(),
      };
      localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(payload));
      if (!silent) alert("임시저장 완료 (LocalStorage)");
    } catch (e) {
      console.error("saveDraftToLocalStorage error", e);
      if (!silent) alert("임시저장 중 오류가 발생했습니다.");
    }
  };
  const autoSaveDraftToLocalStorage = () => saveDraftToLocalStorage(true);
  const loadDraftFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY);
      if (!raw) return false;
      const meta = JSON.parse(raw) as { v: number; title: string; tags: string; thumbnailUrl: string; content: string; ts?: number };
      setTitle(meta.title || "");
      setTags(meta.tags || "");
      setThumbnailUrl(meta.thumbnailUrl || "");
      setContent(meta.content || "");
      if (meta.ts) setLastSavedAt(meta.ts);
      return true;
    } catch (e) {
      console.error("loadDraftFromLocalStorage error", e);
      return false;
    }
  };

  useEffect(() => {
    // 1) Try LocalStorage first
    const restoredLS = loadDraftFromLocalStorage();
    if (restoredLS) {
      console.info("임시저장 불러옴 (LocalStorage)");
    } else {
      // 2) Fallback & migrate from cookies
      const restoredCookie = loadDraftFromCookies();
      if (restoredCookie) {
        saveDraftToLocalStorage(true);
        clearDraftCookies();
        console.info("쿠키 임시저장을 LocalStorage로 마이그레이션했습니다.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave on changes with debounce
  useEffect(() => {
    // If nothing yet, don't autosave empty initial state immediately
    const hasAny = title.trim() || tags.trim() || thumbnailUrl.trim() || (content && content.trim());
    if (!hasAny) return;

    setAutoSaveStatus("saving");
    const t = setTimeout(() => {
      try {
  autoSaveDraftToLocalStorage();
        setAutoSaveStatus("saved");
        setLastSavedAt(Date.now());
      } catch (e) {
        setAutoSaveStatus("error");
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [title, tags, thumbnailUrl, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content || !content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      // 백엔드 게시글 생성 API가 준비되면 여기에서 POST 호출합니다.
      // 예) await fetch("/api/posts", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ title, content, tags: parsedTags, thumbnail_url: thumbnailUrl, token }) })
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      console.log("[Draft Save]", { title, content, tags: parsedTags, thumbnailUrl });
  // 성공적으로 게시 완료 시 임시저장 제거 (현재는 임시 로직)
  clearDraftLocalStorage();
  clearDraftCookies(); // 과거 쿠키 임시저장도 함께 정리
  alert("게시글이 임시로 저장되었습니다. (백엔드 연동 필요)\n임시저장(LocalStorage/쿠키) 데이터는 삭제되었습니다.");
      navigate("/posts");
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>게시글 작성</h1>
          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate(-1)}>
              취소
            </button>
            <button
              type="button"
              className={`${styles.btn}`}
              onClick={() => saveDraftToLocalStorage(false)}
            >
              임시저장
            </button>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "저장 중..." : "게시하기"}
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
            <div style={{ marginRight: "auto", fontSize: 12, color: "#9aa0a6" }}>
              {autoSaveStatus === "saving" && "자동저장 중…"}
              {autoSaveStatus === "saved" && lastSavedAt && `자동저장됨 ${new Date(lastSavedAt).toLocaleTimeString()}`}
              {autoSaveStatus === "error" && "자동저장 오류"}
            </div>
              <label htmlFor="title" className={styles.label}>
                제목 <span className={styles.required}>*</span>
              </label>
              <input
                id="title"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력하세요"
                maxLength={200}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.row}`}>
              <div>
                <label htmlFor="tags" className={styles.label}>
                  태그 (쉼표로 구분)
                </label>
                <input
                  id="tags"
                  className={styles.input}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="예: React, Markdown, 커뮤니티"
                />
              </div>
              <div>
                <label htmlFor="thumb" className={styles.label}>
                  썸네일 URL
                </label>
                <input
                  id="thumb"
                  className={styles.input}
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {thumbnailUrl && (
              <div className={styles.formGroup}>
                <div className={styles.previewBox}>
                  {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                  <img
                    src={thumbnailUrl}
                    alt="썸네일 미리보기"
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                    onError={(e) => ((e.currentTarget.style.display = "none"))}
                  />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>내용 (마크다운) <span className={styles.required}>*</span></label>
              <div data-color-mode="dark">
                <MDEditor value={content} onChange={(v) => setContent(v || "")} height={420} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>미리보기</label>
              <div className={styles.previewBox}>
                <MDEditor.Markdown source={content} />
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate(-1)}>
                취소
              </button>
              <button type="button" className={`${styles.btn}`} onClick={() => saveDraftToLocalStorage(false)}>
                임시저장
              </button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                {saving ? "저장 중..." : "게시하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default PostWrite;
