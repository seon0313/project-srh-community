import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Post.module.css";
import Topbar from "./Topbar";

function Post() {
    const [searchParams] = useSearchParams();
    const [post, setPost] = useState<{
        id: string;
        type: string;
        category: string;
        author: string;
        author_id: string;
        thumbnail_url: string;
        title: string;
        content: string;
        upload_time: number;
        edited: number;
        state: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const postId = searchParams.get("id");
        if (!postId) {
            setLoading(false);
            return;
        }

        fetch(`/api/post?id=${postId}`)
            .then((res) => res.json())
            .then((data) => {
                setPost(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [searchParams]);

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

    return (
        <>
            <Topbar />
            <div className={styles.postContainer}>
                <header className={styles.postHeader}>
                    <h1 className={styles.postTitle}>{post.title}</h1>
                    <div className={styles.postMeta}>
                        <span>Author: {post.author}</span>
                        <span>Category: {post.category}</span>
                        <span>Uploaded: {new Date(post.upload_time).toLocaleString()}</span>
                    </div>
                </header>

                <div className={styles.postBody}>
                    <img src={post.thumbnail_url} alt={post.title} className={styles.postThumbnail} />
                    <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <footer className={styles.postFooter}>
                    <span>Type: {post.type}</span>
                    <span>State: {post.state}</span>
                    <span>Edited: {post.edited ? "Yes" : "No"}</span>
                </footer>
            </div>
        </>
    );
}

export default Post;