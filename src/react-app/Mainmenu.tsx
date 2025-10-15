import "./Mainmenu.css";
import { useNavigate } from "react-router-dom";

function Mainmenu() {
  const navigate = useNavigate();

  return (
    <>
      <div className="Mainmenu">
        <h1>서울로봇고 카르텔</h1>
        <button onClick={() => navigate("/login")}>로그인</button>
        <div className="main">
            <div className="mainItem">
                <p>정보</p>
            </div>
            <div className="mainItem">
                <p>Main Content</p>
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
