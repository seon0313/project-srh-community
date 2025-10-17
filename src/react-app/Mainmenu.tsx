import styles from "./Mainmenu.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Topbar from "./Topbar";

function Mainmenu() {
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
    <div className={styles.Mainmenu}>
      <Topbar />
      <div className={styles.main}>
        <div className={styles.mainItem}>
          <p>정보</p>
        </div>
        <div className={styles.mainItem}>
          <table className={styles.posttable}>
            <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className={styles.loadingSpace}>
                      <div className={styles.loadingSpinner}></div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {posts.map((post, index) => (
                        <tr 
                            key={post.id} 
                            className={styles.postitem}
                            style={{ '--item-index': index } as React.CSSProperties}
                        >
                            <td 
                                className={styles.postTitle}
                                onClick={() => navigate("/post/" + post.id)}
                            >
                                <strong>{post.title}</strong>
                            </td>
                            <td 
                                className={styles.postAuthor} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/user/" + post.author);
                                }}
                            >
                                <strong>{post.author}</strong>
                            </td>
                            <td 
                                className={styles.postDate}
                                onClick={() => navigate("/post/" + post.id)}
                            >
                                <strong>{post.date}</strong>
                            </td>
                        </tr>
                    ))}
                  </>
                )}
                <tr className={styles.moreButtonContainer}>
                    <td colSpan={3} className={styles.moreButton} onClick={() => navigate("/posts")}>
                        <p>더보기</p>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.mainItem}>
          <p>로봇고 프렌즈</p>
        </div>
      </div>
    </div>
  );
}

export default Mainmenu;
