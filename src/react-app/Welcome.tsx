import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Welcome.module.css";

function Welcome() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["방패가", "도움이", "인맥이"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <>
    <div className="Welcome">
        <div className={styles.welcomeContainer}>
            <div className={styles.titleContainer}>
                <span className={styles.titleWord} style={{animationDelay: '0.3s'}}>학연,</span>
                <span className={styles.titleWord} style={{animationDelay: '0.8s'}}>지연,</span>
                <span className={styles.titleWord} style={{animationDelay: '1.3s'}}>혈연</span>
            </div>
            
            <div className={styles.subtitleContainer}>
                <span className={styles.staticText}>우리들이 서로의</span>
                <div className={styles.animatedWordContainer}>
                    {words.map((word, index) => (
                        <span 
                            key={index} 
                            className={styles.animatedWord}
                            style={{
                                animationDelay: `${index * 1.33}s`,
                                opacity: currentWord === index ? 1 : 0,
                                transform: `translateX(-50%) translateY(${currentWord === index ? '-50%' : '50%'})`
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </div>
                <span className={styles.staticText}>되어주자.</span>
            </div>
            
            <button 
                className={styles.startButton} 
                onClick={() => navigate("/")}
            >
                시작하기
            </button>
        </div>
        
        <div className={styles.credits}>
            개발 / 배포 <a href="https://pages.seon06.co.kr">추윤선</a>
        </div>
    </div>
    </>
  );
}

export default Welcome;