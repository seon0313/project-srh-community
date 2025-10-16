import "./Mainmenu.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Mainmenu() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<{ id: number; title: string; author: string; date: string }[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  return (
    <>
      <div className="Mainmenu">
        <h1>서울로봇고 카르텔</h1>
        <table className="mainmenu_topbar">
          <tr>
            <td onClick={() => navigate("/app")}>
                <a>채팅</a>
            </td>
            <td onClick={() => navigate("/app")}>
                <a>게시판</a>
            </td>
            <td onClick={() => navigate("/app")}>
                <a>소개</a>
            </td>
            <td onClick={() => navigate("/app")}>
                <a>AI</a>
            </td>
            <td onClick={() => navigate("/login")}>
                <a>프로필</a>
            </td>
          </tr>
        </table>
        
        <div className="main">
            <div className="mainItem">
                <p>정보</p>
            </div>
            <div className="mainItem">
                <table className="posttable">
                    {posts.map(post => (
                        <tr key={post.id} className="postitem">
                            <td>
                                <strong>{post.title}</strong>
                            </td>
                            <td>
                                <strong>{post.author}</strong>
                            </td>
                            <td>
                                <strong>{post.date}</strong>
                            </td>
                        </tr>
                    ))}
                </table>

            </div>
            <div className="mainItem">
                <p>로봇고 프렌즈</p>
            </div>
        </div>
      </div>
    </>
  );
}

export default Mainmenu;
