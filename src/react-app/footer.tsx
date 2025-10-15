import { useNavigate } from "react-router-dom";
import "./footer.css";

function Footer() {
  const navigate = useNavigate();

  return (
    <>
      <div className="Footer">
        <p>개발 / 배포 <a href="https://pages.seon06.co.kr">추윤선</a></p>
        <p><a>개인정보 처리방침</a> | <a>이용약관</a></p>
        <p>© 2023 <a href="https://github.com/seon0313">seon0313</a>. All rights reserved.</p>
      </div>
    </>
  );
}

export default Footer;