import { useEffect, useState } from "react";

// 날짜를 yy.mm.dd 형식으로 변환하는 함수
function formatDate(d: number | string) {
    const date = new Date(typeof d === "string" ? parseFloat(d) : d);
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${y}.${m}.${day}`;
}
import style from "./Posts.module.css";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";

function Posts() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<{ id: number; title: string; author: string; date: string }[]>([]);
    const [noticePosts, setNoticePosts] = useState<{ id: number; title: string; author: string; date: string }[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<{ id: number; title: string; author: string; date: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        fetch("/api/posts")
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setFilteredPosts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
        fetch("/api/notice-posts", { method: "POST" })
            .then(res => res.json())
            .then(data => setNoticePosts(data));
            
    }, []);

    const handleSearch = () => {
        let filtered = posts;
        
        if (searchTerm) {
            filtered = filtered.filter((post) => {
                switch (filterType) {
                    case "title":
                        return post.title.toLowerCase().includes(searchTerm.toLowerCase());
                    case "author":
                        return post.author.toLowerCase().includes(searchTerm.toLowerCase());
                    case "all":
                    default:
                        return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               post.author.toLowerCase().includes(searchTerm.toLowerCase());
                }
            });
        }
        
        setFilteredPosts(filtered);
    };

    useEffect(() => {
        handleSearch();
    }, [posts, searchTerm, filterType]);

    const handleWriteClick = () => {
        // Handle the click event for the 글쓰기 button
        navigate("/manager"); // Navigate to the write post page
    };

    return (
        <>
            <div className="Post">
                <Topbar />

                <div className={style.stageContainer}>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=all")}>재학생</button>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=notice")}>학부모</button>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=general")}>게스트</button>
                </div>

                <div className={style.categoryContainer}>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=all")}>전체</button>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=notice")}>일반</button>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=general")}>공지</button>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=question")}>질문</button>
                    <button className={style.categoryButton} onClick={() => navigate("/posts?category=discussion")}>익명</button>
                </div>
                
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
                                    {/* 공지글 먼저 출력 */}
                                    {noticePosts.map((post, index) => {
                                        const isFirst = index === 0;
                                        const isLast = index === noticePosts.length - 1;
                                        const noticeClass = `${style.postitem} ${style.noticePost}`;
                                        return (
                                            <tr
                                                key={`notice-${post.id}`}
                                                className={noticeClass}
                                                style={{ '--item-index': index } as React.CSSProperties}
                                            >
                                                <td
                                                    className={
                                                        `${style.postTitle} ${isFirst ? style.noticeTdTopLeft : ''} ${isLast ? style.noticeTdBottomLeft : ''}`
                                                    }
                                                    onClick={() => navigate(`/post/${post.id}`)}
                                                >
                                                    <strong>{post.title}</strong>
                                                </td>
                                                <td
                                                    className={style.postAuthor}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/user/${post.author}`);
                                                    }}
                                                >
                                                    <strong>{post.author}</strong>
                                                </td>
                                                <td
                                                    className={
                                                        `${style.postDate} ${isFirst ? style.noticeTdTopRight : ''} ${isLast ? style.noticeTdBottomRight : ''}`
                                                    }
                                                    onClick={() => navigate(`/post/${post.id}`)}
                                                >
                                                    <strong>{formatDate(post.date)}</strong>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* 일반 게시글 */}
                                    {filteredPosts.map((post, index) => (
                                        <tr
                                            key={post.id}
                                            className={style.postitem}
                                            style={{ "--item-index": noticePosts.length + index } as React.CSSProperties}
                                        >
                                            <td
                                                className={style.postTitle}
                                                onClick={() => navigate(`/post/${post.id}`)}
                                            >
                                                <strong>{post.title}</strong>
                                            </td>
                                            <td
                                                className={style.postAuthor}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/user/${post.author}`);
                                                }}
                                            >
                                                <strong>{post.author}</strong>
                                            </td>
                                            <td
                                                className={style.upload_time}
                                                onClick={() => navigate(`/post/${post.id}`)}
                                            >
                                                <strong>{formatDate(post.date)}</strong>
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
                <div className={style.searchBar}>
                    <select 
                        className={style.filterSelect}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="author">작성자</option>
                    </select>
                    <input
                        type="text"
                        className={style.searchInput}
                        placeholder="검색어를 입력하세요..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className={style.searchButton}
                        onClick={handleSearch}
                    >
                        검색
                    </button>
                </div>
                <div className={style.writeButtonContainer}>
                    <button className={style.writeButton} onClick={handleWriteClick}>글쓰기</button>
                </div>
            </div>
        </>
    );
}

export default Posts;