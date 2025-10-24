import { useState } from "react";
import styles from "./Chat.module.css";

interface Friend {
    id: number;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
}

interface ChatRoom {
    id: number;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    avatar: string;
    isGroup: boolean;
    participants?: number;
}

function Chat() {
    const [isFriendsExpanded, setIsFriendsExpanded] = useState(false);
    const [selectedChat, setSelectedChat] = useState<number | null>(null);

    // 샘플 데이터
    const friends: Friend[] = [
        { id: 1, name: "김민수", avatar: "🧑‍💻", status: "online" },
        { id: 2, name: "이지영", avatar: "👩‍🎨", status: "online" },
        { id: 3, name: "박준호", avatar: "👨‍🔬", status: "away" },
        { id: 4, name: "최서연", avatar: "👩‍💼", status: "offline", lastSeen: "5분 전" },
        { id: 5, name: "정태훈", avatar: "👨‍🎓", status: "online" },
        { id: 6, name: "한소미", avatar: "👩‍🏫", status: "offline", lastSeen: "1시간 전" },
    ];

    const chatRooms: ChatRoom[] = [
        {
            id: 1,
            name: "학연 모임",
            lastMessage: "내일 모임 장소 확인 부탁드립니다",
            timestamp: "오후 2:30",
            unreadCount: 3,
            avatar: "🎓",
            isGroup: true,
            participants: 12
        },
        {
            id: 2,
            name: "김민수",
            lastMessage: "프로젝트 관련해서 얘기해보자",
            timestamp: "오후 1:45",
            unreadCount: 0,
            avatar: "🧑‍💻",
            isGroup: false
        },
        {
            id: 3,
            name: "지연 네트워킹",
            lastMessage: "새로운 기회가 있어서 공유합니다",
            timestamp: "오전 11:20",
            unreadCount: 1,
            avatar: "🌐",
            isGroup: true,
            participants: 8
        },
        {
            id: 4,
            name: "이지영",
            lastMessage: "디자인 피드백 감사합니다!",
            timestamp: "어제",
            unreadCount: 0,
            avatar: "👩‍🎨",
            isGroup: false
        },
        {
            id: 5,
            name: "혈연 가족방",
            lastMessage: "주말에 모임 어떠세요?",
            timestamp: "어제",
            unreadCount: 5,
            avatar: "👨‍👩‍👧‍👦",
            isGroup: true,
            participants: 6
        }
    ];

    return (
        <div className={styles.chatContainer}>
            {/* 친구 목록 사이드바 */}
            <div className={`${styles.friendsSidebar} ${isFriendsExpanded ? styles.expanded : ''}`}>
                <div className={styles.friendsHeader}>
                    <button 
                        className={`${styles.toggleButton} ${isFriendsExpanded ? styles.expanded : ''}`}
                        onClick={() => setIsFriendsExpanded(!isFriendsExpanded)}
                    >
                        <span className={styles.toggleIcon}>▶</span>
                    </button>
                    {isFriendsExpanded && <h3>친구 목록</h3>}
                </div>
                
                <div className={styles.friendsList}>
                    {friends.map((friend) => (
                        <div key={friend.id} className={styles.friendItem}>
                            <div className={styles.friendAvatar}>
                                <span className={styles.avatar}>{friend.avatar}</span>
                                <div className={`${styles.statusDot} ${styles[friend.status]}`}></div>
                            </div>
                            {isFriendsExpanded && (
                                <div className={styles.friendInfo}>
                                    <span className={styles.friendName}>{friend.name}</span>
                                    {friend.status === 'offline' && friend.lastSeen && (
                                        <span className={styles.lastSeen}>{friend.lastSeen}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 채팅방 목록 */}
            <div className={styles.chatRoomsContainer}>
                <div className={styles.chatHeader}>
                    <h2>채팅</h2>
                    <button className={styles.newChatButton}>
                        ✉️ 새 채팅
                    </button>
                </div>

                <div className={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="채팅방 검색..." 
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.chatRoomsList}>
                    {chatRooms.map((room) => (
                        <div 
                            key={room.id} 
                            className={`${styles.chatRoomItem} ${selectedChat === room.id ? styles.selected : ''}`}
                            onClick={() => setSelectedChat(room.id)}
                        >
                            <div className={styles.roomAvatar}>
                                <span className={styles.avatar}>{room.avatar}</span>
                                {room.isGroup && (
                                    <span className={styles.groupBadge}>{room.participants}</span>
                                )}
                            </div>
                            
                            <div className={styles.roomInfo}>
                                <div className={styles.roomHeader}>
                                    <span className={styles.roomName}>{room.name}</span>
                                    <span className={styles.timestamp}>{room.timestamp}</span>
                                </div>
                                <p className={styles.lastMessage}>{room.lastMessage}</p>
                            </div>
                            
                            {room.unreadCount > 0 && (
                                <div className={styles.unreadBadge}>
                                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Chat;