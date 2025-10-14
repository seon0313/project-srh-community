import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    return (
        <>
        <div className="Signin">
            <h1>회원가입</h1>
            <input
            type="text"
            placeholder="이름"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => navigate("/app")}>로그인</button>
        
            <p><a href="/signup">인스타</a> DM으로 편리하게 회원가입</p>
        </div>
      </>
    );
}

export default Signin;