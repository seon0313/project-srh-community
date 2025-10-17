import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <>
    <div className="Welcome">
        <h2>학연 지연 혈연</h2>
        <h2>우리들이 서로의 방패가 되어주자.</h2>
        
        <button onClick={() => navigate("/")}>시작하기</button>
        
        <p>개발 / 배포 <a href="https://pages.seon06.co.kr">추윤선</a></p>
    </div>
    </>
  );
}

export default Welcome;