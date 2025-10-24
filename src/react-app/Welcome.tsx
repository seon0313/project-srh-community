import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Welcome.module.css";

function Welcome() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('large'); // 'large' | 'shrinking' | 'hidden' | 'showUI' | 'finalTitle'
  const words = ["방패가", "도움이", "인맥이"];

  useEffect(() => {
    // Phase 1: Large horizontal words (0s - 2s)
    // Phase 2: Shrink and move to position (2s - 3s)  
    // Phase 3: Hide title (opacity 0, height 0) (3s - 3.5s)
    // Phase 4: Show other UI elements (3.5s - 4s)
    // Phase 5: Show final title with animation (4s+)
    
    const timer1 = setTimeout(() => {
      setAnimationPhase('shrinking');
    }, 2000);
    
    const timer2 = setTimeout(() => {
      setAnimationPhase('hidden');
    }, 3000);
    
    const timer3 = setTimeout(() => {
      setAnimationPhase('showUI');
    }, 3500);
    
    const timer4 = setTimeout(() => {
      setAnimationPhase('finalTitle');
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  useEffect(() => {
    if (animationPhase === 'finalTitle') {
      const interval = setInterval(() => {
        setCurrentWord((prev) => (prev + 1) % words.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [animationPhase, words.length]);

  return (
    <>
    <div className="Welcome">
        <div className={styles.welcomeContainer}>
            <div className={`${styles.titleContainer} ${animationPhase === 'large' ? styles.largeTitles : ''} ${animationPhase === 'shrinking' ? styles.shrinkTitles : ''} ${animationPhase === 'hidden' ? styles.hiddenTitles : ''} ${animationPhase === 'finalTitle' ? styles.finalTitles : ''}`}>
                <span className={styles.titleWord}>학연,</span>
                <span className={styles.titleWord}>지연,</span>
                <span className={styles.titleWord}>혈연</span>
            </div>
            
            <div className={`${styles.subtitleContainer} ${(animationPhase === 'showUI' || animationPhase === 'finalTitle') ? styles.showSubtitle : ''}`}>
                <span className={styles.staticText}>우리들이 서로의</span>
                <div className={styles.animatedWordContainer}>
                    {words.map((word, index) => (
                        <span 
                            key={index} 
                            className={styles.animatedWord}
                            style={{
                                animationDelay: `${index * 1.33}s`,
                                opacity: animationPhase === 'finalTitle' && currentWord === index ? 1 : 0,
                                transform: `translateX(-50%) translateY(${animationPhase === 'finalTitle' && currentWord === index ? '-50%' : '50%'})`
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </div>
                <span className={styles.staticText}>되어주자.</span>
            </div>
            
            <button 
                className={`${styles.startButton} ${(animationPhase === 'showUI' || animationPhase === 'finalTitle') ? styles.showButton : ''}`}
                onClick={() => navigate("/")}
            >
                시작하기
            </button>
        </div>
        
        <div className={`${styles.credits} ${(animationPhase === 'showUI' || animationPhase === 'finalTitle') ? styles.showCredits : ''}`}>
            개발 / 배포 <a href="https://pages.seon06.co.kr">추윤선</a>
        </div>
    </div>
    </>
  );
}

export default Welcome;