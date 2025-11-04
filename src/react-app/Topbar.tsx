import styles from "./Mainmenu.module.css";
import { useNavigate, useLocation } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { usePresence } from "./utils/presence";

function Topbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") ?? undefined : undefined), [location.pathname]);
    const { onlineList } = usePresence(isLoggedIn ? token : undefined);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);
    

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
                        <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span title="온라인 유저" style={{ display: "inline-block", width: 10, height: 10, borderRadius: 999, background: onlineList.length > 0 ? "#22c55e" : "#9ca3af" }} />
                                <small style={{ color: "#6b7280" }}>{onlineList.length}</small>
                            </div>
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
