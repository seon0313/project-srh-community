import { useState } from "react";
import style from "./Login.module.css";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    return (
        <>
            <div className="Login">
                <h1>로그인</h1>
                <div className={style.loginForm}>
                    <input
                        className={style.input}
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className={style.input}
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className={style.loginButton} onClick={() => navigate("/app")}>로그인</button>
                </div>
                <p>계정이 없으신가요? <a onClick={() => navigate("/signup")}>회원가입</a></p>
            </div>
        </>
    );
}

export default Login;