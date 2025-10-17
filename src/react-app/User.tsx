import { useNavigate, useParams } from "react-router-dom";

function User() {
    const navigate = useNavigate();
    const p = useParams()

    return (
        <>
        <div className="User">
            <h1>사용자 정보</h1>
            <p>ID: {p.id}</p>

            <p>계정이 없으신가요? <a onClick={() => navigate("/signup")}>회원가입</a></p>
        </div>
        </>
    );
}

export default User;