import "./Mainmenu.css";
import { useNavigate } from "react-router-dom";

function Mainmenu() {
  const navigate = useNavigate();

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
