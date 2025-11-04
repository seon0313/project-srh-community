import { useState } from "react";
import style from "./Login.module.css";
import { useNavigate } from "react-router-dom";


function Login() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError("");
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, password })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || "로그인 실패");
                return;
            }
            localStorage.setItem("token", data.token);
            window.dispatchEvent(new Event("token-change"));
            navigate("/");
        } catch (e) {
            setError("서버 오류가 발생했습니다.");
        }
    };

    return (
        <>
            <div className="Login">
                <h1>로그인</h1>
                <div className={style.loginForm}>
                    <input
                        className={style.input}
                        type="text"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                    <input
                        className={style.input}
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className={style.loginButton} onClick={handleLogin}>로그인</button>
                    {error && <div style={{ color: "#ff8080", marginTop: 8 }}>{error}</div>}
                </div>
                <p>계정이 없으신가요? <a onClick={() => navigate("/signup")}>회원가입</a></p>
            </div>
        </>
    );
}

export default Login;