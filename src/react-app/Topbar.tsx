import styles from "./Mainmenu.module.css";
import { useNavigate } from "react-router-dom";

function Topbar() {
    const navigate = useNavigate();

    return (
        <div className={styles.mainmenu_topbar}>
            <h1 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                서비스명
            </h1>
            <table className={styles.mainmenu_topbar}>
                <tbody>
                    <tr>
                        <td onClick={() => navigate("/chat")}>
                            <a>채팅</a>
                        </td>
                        <td onClick={() => navigate("/posts")}>
                            <a>게시판</a>
                        </td>
                        <td onClick={() => navigate("/welcome")}>
                            <a>소개</a>
                        </td>
                        <td onClick={() => navigate("/ai")}>
                            <a>AI Chat</a>
                        </td>
                        <td onClick={() => navigate("/profile")}>
                            <a>프로필</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Topbar;
