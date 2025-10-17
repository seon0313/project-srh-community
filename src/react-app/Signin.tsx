import { useState } from "react";
import style from "./Login.module.css";
import { useNavigate } from "react-router-dom";

function Signin() {
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordre, setPasswordre] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [showDetails2, setShowDetails2] = useState(false);
    const navigate = useNavigate();

    function handleSignup() {
        if (!id || !email || !password || !passwordre) {
            alert("모든 항목을 입력해주세요.");
            return;
        }
        
        // 이메일 양식 확인
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("올바른 이메일 형식을 입력해주세요.");
            return;
        }
        
        if (password !== passwordre) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        alert("회원가입이 완료되었습니다.\n졸업생 및 재학생 인증은 프로필에서 가능합니다.");
        navigate("/");
    }

    return (
        <>
        <div className="Login">
            <h1>회원가입</h1>
            <input
                className={style.input}
                type="text"
                placeholder="아이디"
                value={id}
                onChange={(e) => setId(e.target.value)}
            />
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
            <input
                className={style.input}
                type="password"
                placeholder="비밀번호 확인"
                value={passwordre}
                onChange={(e) => setPasswordre(e.target.value)}
            />
            <button className={style.loginButton} onClick={handleSignup}>회원가입</button>

            <p><a href="/signup">인스타 DM</a>으로 편리하게 회원가입</p>

            <button 
                onClick={() => setShowDetails(!showDetails)}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#0d7377', 
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '10px 0',
                    fontSize: '14px'
                }}
            >
                {showDetails ? '▼ 인스타 DM으로 회원가입은 뭔가요?' : '▶ 인스타 DM으로 회원가입은 뭔가요?'}
            </button>

            {showDetails && (
                <div style={{ marginTop: '10px' }}>
                    <span>회원가입 후 로봇고 재학생 및 졸업생 인증은 프로필에서 설정해야 합니다.</span>
                    <span>인스타 DM으로 로봇고 학생을 인증하면 본인의 계정을 생성하여 드립니다.</span>
                    <span>로그인 하여 비밀번호만 변경하면 됩니다.</span>
                </div>
            )}

            <button 
                onClick={() => setShowDetails2(!showDetails2)}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#0d7377', 
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '10px 0',
                    fontSize: '14px'
                }}
            >
                {showDetails2 ? '▼ 서울로봇고 카르텔은 안전한가요?' : '▶ 서울로봇고 카르텔은 안전한가요?'}
            </button>

            {showDetails2 && (
                <div style={{ marginTop: '10px' }}>
                    <span>모든 데이터는 암호화 하여 서버에 저장됩니다.</span>
                    <span>개인정보는 파기 요청시 즉시 삭제되며 프로필에서 삭제할 수 있습니다.</span>
                    <span>Cloudflare의 서버를 이용하여 안전하게 보호됩니다.</span>
                </div>
            )}
        </div>
    </>
    );
}

export default Signin;