import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Post.module.css";
import Topbar from "./Topbar";

type PostType = {
    id: string;
    type: string;
    category: string;
    author: string;
    author_id: string;
    thumbnail_url: string;
    title: string;
    content: string;
    upload_time: number | string;
    edited: number;
    state: string;
};

type Comment = {
    id: string;
    postId: string;
    author: string;
    content: string;
    created_at: string;
};

function Post() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<PostType | null>(null);
    const [loading, setLoading] = useState(true);

    // comments state and form
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentAuthor, setCommentAuthor] = useState("");
    const [commentContent, setCommentContent] = useState("");

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/api/post?id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                setPost(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("/api/post error:", err);
                setLoading(false);
            });

        // try to load comments
        setCommentsLoading(true);
        fetch(`/api/comments?postId=${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("no-comments-api");
                return res.json();
            })
            .then((data) => setComments(Array.isArray(data) ? data : []))
            .catch(() => {
                // if comments API doesn't exist, keep comments empty (graceful)
                setComments([]);
            })
            .finally(() => setCommentsLoading(false));
    }, [id]);

    const handleBack = () => navigate(-1);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if ((navigator as any).share) {
                await (navigator as any).share({ title: post?.title || "Post", url });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                alert("URL이 복사되었습니다.");
            } else {
                // fallback: prompt
                window.prompt("Copy this URL", url);
            }
        } catch (e) {
            console.error("share error", e);
            alert("공유에 실패했습니다.");
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !commentContent.trim()) return;

        const newComment: Comment = {
            id: `local-${Date.now()}`,
            postId: id,
            author: commentAuthor || "익명",
            content: commentContent,
            created_at: new Date().toISOString(),
        };

        // Optimistic UI
        setComments((c) => [newComment, ...c]);
        setCommentAuthor("");
        setCommentContent("");

        try {
            const res = await fetch(`/api/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: id, author: newComment.author, content: newComment.content }),
            });
            if (!res.ok) throw new Error("failed to post comment");
            const saved = await res.json();
            // replace local comment id with saved id if returned
            setComments((list) => list.map((c) => (c.id === newComment.id ? { ...c, id: saved.id ?? c.id } : c)));
        } catch (err) {
            console.warn("Posting comment failed, kept locally", err);
            // keep local comment but optionally mark as unsynced (omitted for simplicity)
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
            </div>
        );
    }

    if (!post) {
        return <div className={styles.notFound}>Post not found.</div>;
    }

    // 날짜 포맷: YYYY.MM.DD HH:mm
    const formatDate = (d: number | string) => {
        const date = new Date(typeof d === "string" ? parseFloat(d) : d);
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const h = date.getHours().toString().padStart(2, "0");
        const min = date.getMinutes().toString().padStart(2, "0");
        return `${y}.${m}.${day} ${h}:${min}`;
    };

    return (
        <>
            <Topbar />
            <div className={styles.postContainer}>
                <div className={styles.actionBar}>
                    <button className={styles.backButton} onClick={handleBack} aria-label="뒤로가기">← 뒤로</button>
                    <div className={styles.actionSpacer} />
                    <button className={styles.shareButton} onClick={handleShare} aria-label="공유">공유</button>
                </div>

                <header className={styles.postHeader}>
                    <h1 className={styles.postTitle}>{post.title}</h1>
                    <div className={styles.postMeta}>
                        <span className={styles.authorBadge}>by {post.author}</span>
                        <span className={styles.dateLabel}>{formatDate(post.upload_time)}</span>
                    </div>
                </header>

                <div className={styles.postBody}>
                    {post.thumbnail_url && (
                        <img src={post.thumbnail_url} alt={post.title} className={styles.postThumbnail} />
                    )}
                    <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
            </div>

            {/* Comments container is now outside the postContainer */}
            <section className={styles.commentSection} aria-label="댓글">
                <h3 className={styles.commentHeading}>댓글</h3>

                <form className={styles.commentForm} onSubmit={handlePostComment}>
                    <input
                        className={styles.commentInput}
                        placeholder="이름 (선택)"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                    />
                    <textarea
                        className={styles.commentTextarea}
                        placeholder="댓글을 입력하세요..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        rows={4}
                    />
                    <div className={styles.commentActions}>
                        <button type="submit" className={styles.commentSubmit}>댓글 등록</button>
                    </div>
                </form>

                {commentsLoading ? (
                    <div className={styles.commentsLoading}><div className={styles.loadingSpinner}></div></div>
                ) : (
                    <ul className={styles.commentList}>
                        {comments.map((c) => (
                            <li key={c.id} className={styles.commentItem}>
                                <div className={styles.commentHeader}>
                                    <strong className={styles.commentAuthor}>{c.author}</strong>
                                    <time className={styles.commentTime}>{formatDate(c.created_at)}</time>
                                </div>
                                <div className={styles.commentBody}>{c.content}</div>
                            </li>
                        ))}
                        {comments.length === 0 && (
                            <div className={styles.emptyComments}>첫 댓글을 작성해보세요.</div>
                        )}
                    </ul>
                )}
            </section>
        </>
    );
}

export default Post;