import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./AI.module.css";

type Message = {
    role: "user" | "system";
    message: string;
};

function AI() {
    const [aiPrompt, setAiPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);

    // 스크롤 위치 감지
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            // 스크롤이 최하단 근처(50px 이내)에 있으면 자동 스크롤 활성화
            shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
        }
    };

    // 메시지가 변경될 때 자동 스크롤
    useEffect(() => {
        if (shouldAutoScrollRef.current && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchAiStream = async () => {
        if (!aiPrompt.trim()) return;
        
        // 사용자 메시지 추가
        const newMessages: Message[] = [...messages, { role: "user", message: aiPrompt }];
        setMessages(newMessages);
        setAiPrompt("");
        shouldAutoScrollRef.current = true; // 새 메시지 전송 시 자동 스크롤 활성화

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
        
        // system 메시지 추가 (빈 메시지로 시작)
        setMessages(prev => [...prev, { role: "system", message: "" }]);

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
                            
                            // 마지막 system 메시지에 텍스트 추가
                            setMessages(prev => {
                                const updated = [...prev];
                                const lastIdx = updated.length - 1;
                                if (lastIdx >= 0 && updated[lastIdx].role === "system") {
                                    updated[lastIdx] = {
                                        ...updated[lastIdx],
                                        message: updated[lastIdx].message + responseText
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
                    <div key={idx} className={msg.role === "user" ? styles.userMessage : styles.systemMessage}>
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                    </div>
                ))}
            </div>

            <div className={styles.inputContainer}>
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