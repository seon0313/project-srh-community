import styles from "./Mainmenu.module.css";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

function Topbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

    async function checkLogin() {
        const jwtToken = localStorage.getItem("token");
        if (!jwtToken) {
            return false;
        }
        const response = await fetch("/api/auth", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwtToken }),
        });
        const data = await response.json();
        if (data.success) {
            return true;
        } else {
            return false;
        }
    }

    useEffect(() => {
        checkLogin().then(setIsLoggedIn);
    }, []);
    

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
                        <td onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}>
                            <a>{isLoggedIn ? "프로필" : "로그인"}</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Topbar;
