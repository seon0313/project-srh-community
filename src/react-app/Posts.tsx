import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// 날짜를 상황별로 포맷: 오늘이면 HH:mm, 올해면 mm.dd, 그 외는 yy.mm.dd
function formatDate(d: number | string) {
    if (!d) return '-';
    let date: Date;
    if (typeof d === 'number') {
        if (d > 1e12) date = new Date(d);
        else date = new Date(d * 1000);
    } else if (typeof d === 'string') {
        if (/^\d+$/.test(d)) {
            const num = Number(d);
            if (d.length === 13) date = new Date(num);
            else if (d.length === 10) date = new Date(num * 1000);
            else return '-';
        } else {
            date = new Date(d);
        }
    } else {
        return '-';
    }
    if (isNaN(date.getTime())) return '-';
    const now = new Date();
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    // 오늘이면 HH:mm
    if (
        y === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    ) {
        return `${hour}:${min}`;
    }
    // 올해면 mm.dd
    if (y === now.getFullYear()) {
        return `${m}.${day}`;
    }
    // 그 외는 yy.mm.dd
    return `${y.toString().slice(-2)}.${m}.${day}`;
}
import style from "./Posts.module.css";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar";

type PostListItem = {
    id: number;
    title: string;
    author: string;
    upload_time: string | number;
};

function Posts() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [posts, setPosts] = useState<PostListItem[]>([]);
    const [noticePosts, setNoticePosts] = useState<PostListItem[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<PostListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    
    // URL 파라미터에서 type과 category 가져오기 (기본값: public, all)
    const [selectedType, setSelectedType] = useState(searchParams.get("type") || "public");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");

    // type과 category가 변경될 때마다 게시글 불러오기
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("type", selectedType);
        params.append("category", selectedCategory);
        
        fetch(`/api/posts?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                console.log('posts API:', data);
                
                // category가 "all"이면 공지글과 일반글 분리
                if (selectedCategory === "all") {
                    const notices = data.filter((post: PostListItem & { category?: string }) => post.category === "notice");
                    const regulars = data.filter((post: PostListItem & { category?: string }) => post.category !== "notice");
                    setNoticePosts(notices);
                    setPosts(regulars);
                    setFilteredPosts(regulars);
                } else {
                    // 특정 category 선택 시 공지글 영역 비우기
                    setNoticePosts([]);
                    setPosts(data);
                    setFilteredPosts(data);
                }
                
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [selectedType, selectedCategory]);

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
    
    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setSearchParams({ type, category: selectedCategory });
    };
    
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSearchParams({ type: selectedType, category });
    };

    return (
        <>
            <div className="Post">
                <Topbar />

                <div className={style.stageContainer}>
                    <button 
                        className={`${style.categoryButton} ${selectedType === "public" ? style.active : ""}`} 
                        onClick={() => handleTypeChange("public")}
                    >
                        게스트
                    </button>
                    <button 
                        className={`${style.categoryButton} ${selectedType === "student" ? style.active : ""}`} 
                        onClick={() => handleTypeChange("student")}
                    >
                        학생
                    </button>
                    <button 
                        className={`${style.categoryButton} ${selectedType === "parent" ? style.active : ""}`} 
                        onClick={() => handleTypeChange("parent")}
                    >
                        학부모
                    </button>
                </div>

                <div className={style.categoryContainer}>
                    <button 
                        className={`${style.categoryButton} ${selectedCategory === "all" ? style.active : ""}`} 
                        onClick={() => handleCategoryChange("all")}
                    >
                        전체
                    </button>
                    <button 
                        className={`${style.categoryButton} ${selectedCategory === "normal" ? style.active : ""}`} 
                        onClick={() => handleCategoryChange("normal")}
                    >
                        일반
                    </button>
                    <button 
                        className={`${style.categoryButton} ${selectedCategory === "notice" ? style.active : ""}`} 
                        onClick={() => handleCategoryChange("notice")}
                    >
                        공지
                    </button>
                    <button 
                        className={`${style.categoryButton} ${selectedCategory === "question" ? style.active : ""}`} 
                        onClick={() => handleCategoryChange("question")}
                    >
                        질문
                    </button>
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
                                                    <strong>{formatDate(post.upload_time)}</strong>
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
                                                <strong>{formatDate(post.upload_time)}</strong>
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