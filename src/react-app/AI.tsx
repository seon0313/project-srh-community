import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./AI.module.css";

type Message = {
    role: "user" | "system";
    message: string;
    isTyping?: boolean; // AI 타이핑 중인지 표시
    animated?: boolean; // 애니메이션 완료 여부
};

function AI() {
    const [aiPrompt, setAiPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const prevMessageLengthRef = useRef(0);

    // 스크롤 위치 감지
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
        }
    };

    // 메시지가 변경될 때 자동 스크롤
    useEffect(() => {
        if (shouldAutoScrollRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        prevMessageLengthRef.current = messages.length;
    }, [messages]);

    // 입력창 실제 높이를 CSS 변수로 반영
    useEffect(() => {
        const updateComposerH = () => {
            const h = inputContainerRef.current?.offsetHeight ?? 0;
            document.documentElement.style.setProperty("--composer-h", `${h}px`);
        };
        updateComposerH();
        window.addEventListener("resize", updateComposerH);
        return () => window.removeEventListener("resize", updateComposerH);
    }, []);

    // VisualViewport로 키보드 높이 추적
    useEffect(() => {
        const vv = (window as any).visualViewport as VisualViewport | undefined;

        const updateKB = () => {
            const innerH = window.innerHeight;
            let kb = 0;
            if (vv) {
                kb = Math.max(0, innerH - (vv.height + vv.offsetTop));
            }
            document.documentElement.style.setProperty("--kb", `${kb}px`);
        };

        updateKB();
        if (vv) {
            vv.addEventListener("resize", updateKB);
            vv.addEventListener("scroll", updateKB);
        }
        window.addEventListener("resize", updateKB);

        return () => {
            if (vv) {
                vv.removeEventListener("resize", updateKB);
                vv.removeEventListener("scroll", updateKB);
            }
            window.removeEventListener("resize", updateKB);
        };
    }, []);

    const fetchAiStream = async () => {
        if (!aiPrompt.trim()) return;
        
        const newMessages: Message[] = [...messages, { role: "user", message: aiPrompt }];
        setMessages(newMessages);
        setAiPrompt("");
        shouldAutoScrollRef.current = true;

        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newMessages })
        });

        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = "";
        
        // system 메시지 추가 (타이핑 중 표시)
        setMessages(prev => [...prev, { role: "system", message: "", isTyping: true, animated: false }]);

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            if (value) {
                buffer += decoder.decode(value, { stream: true });
                
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                
                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        const jsonStr = line.replace(/^data:\s*/, "").trim();
                        if (!jsonStr || jsonStr === "[DONE]") continue;
                        
                        try {
                            const json = JSON.parse(jsonStr);
                            const responseText = json.response ?? "";
                            
                            if (!responseText) continue;
                            
                            setMessages(prev => {
                                const updated = [...prev];
                                const lastIdx = updated.length - 1;
                                if (lastIdx >= 0 && updated[lastIdx].role === "system") {
                                    updated[lastIdx] = {
                                        ...updated[lastIdx],
                                        message: updated[lastIdx].message + responseText,
                                        isTyping: true,
                                        animated: false // 타이핑 중에는 애니메이션 하지 않음
                                    };
                                }
                                return updated;
                            });
                        } catch (e) {
                            console.error("Failed to parse JSON:", e);
                        }
                    }
                }
            }
            done = readerDone;
        }

        // 타이핑 완료 후 isTyping 제거하고 animated 설정
        setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "system") {
                updated[lastIdx] = { ...updated[lastIdx], isTyping: false, animated: true };
            }
            return updated;
        });
    };

    return (
        <div className={styles.AI}>
            <h1>AI 채팅</h1>
            
            <div 
                className={styles.messagesContainer} 
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`${msg.role === "user" ? styles.userMessage : styles.systemMessage} ${msg.isTyping ? styles.typing : ''} ${msg.animated ? styles.animated : ''}`}
                    >
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                    </div>
                ))}
            </div>

            <div className={styles.inputContainer} ref={inputContainerRef}>
                <input
                    className={styles.input}
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchAiStream()}
                    placeholder="메시지를 입력하세요"
                    type="text"
                />
                <button className={styles.sendButton} onClick={fetchAiStream}>전송</button>
            </div>
        </div>
    );
}

export default AI;