import { useEffect, useState } from "react";
import style from "./Posts.module.css";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";

function Posts() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<{ id: number; title: string; author: string; date: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/posts")
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <div className="Post">
                <Topbar />
                <div className={style.postContainer}>
                    <table className={style.posttable}>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className={style.loadingSpace}>
                                        <div className={style.loadingSpinner}></div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {posts.map((post, index) => (
                                        <tr
                                            key={post.id}
                                            className={style.postitem}
                                            style={{ "--item-index": index } as React.CSSProperties}
                                        >
                                            <td
                                                className={style.postTitle}
                                                onClick={() => navigate("/post/" + post.id)}
                                            >
                                                <strong>{post.title}</strong>
                                            </td>
                                            <td
                                                className={style.postAuthor}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate("/user/" + post.author);
                                                }}
                                            >
                                                <strong>{post.author}</strong>
                                            </td>
                                            <td
                                                className={style.postDate}
                                                onClick={() => navigate("/post/" + post.id)}
                                            >
                                                <strong>{post.date}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )}
                            <tr className={style.moreButtonContainer}>
                                <td colSpan={3} className={style.moreButton} onClick={() => navigate("/posts")}>
                                    <p>더보기</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Posts;