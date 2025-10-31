import { useNavigate, useParams } from "react-router-dom";
import styles from "./User.module.css";
import Topbar from "./Topbar";

import { useRef, useEffect } from "react";

function Profile() {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const cardDivRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const cardDiv = cardDivRef.current;
        if (!canvas || !cardDiv) return;
        const dpr = window.devicePixelRatio || 1;

        function draw() {
            const cardDiv = cardDivRef.current;
            const canvas = canvasRef.current;
            if (!cardDiv || !canvas) return;
            const rect = cardDiv.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + "px";
            canvas.style.height = rect.height + "px";
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, rect.width, rect.height);
            const fontSize = Math.max(20, Math.floor(rect.width * 0.2));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = "#222";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("명함", rect.width / 2, rect.height / 2);
        }

        draw();
        const resizeObserver = new window.ResizeObserver(draw);
        resizeObserver.observe(cardDiv);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <>
        <Topbar />
        <div className={styles.User}>
            <h1>프로필</h1>

            <div className={styles.businessCard} ref={cardDivRef}>
                <canvas
                    ref={canvasRef}
                    style={{ display: "block", width: "100%", height: "100%" }}
                />
            </div>

            <p>계정이 없으신가요? <a onClick={() => navigate("/signup")}>회원가입</a></p>
        </div>
        </>
    );
}

export default Profile;