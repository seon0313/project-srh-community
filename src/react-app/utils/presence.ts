import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PresenceUser = {
  id: string;
  username?: string;
  status: "online" | "idle" | "dnd" | "offline";
  lastSeen: number;
};

export function usePresence(token?: string) {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<Record<string, PresenceUser>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      setUsers({});
      return;
    }
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${window.location.host}/api/presence/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Send initial status
      ws.send(JSON.stringify({ type: "status", status: "online" }));
      // Heartbeat every 25s
      heartbeatRef.current = window.setInterval(() => {
        try { ws.send(JSON.stringify({ type: "heartbeat" })); } catch {}
      }, 25_000);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        const action: string | undefined = data?.action;

        if (action === "snapshot" && Array.isArray(data.users)) {
          const map: Record<string, PresenceUser> = {};
          for (const rawUser of data.users) {
            if (!rawUser?.id) continue;
            map[rawUser.id] = {
              id: rawUser.id,
              username: rawUser.username,
              status: rawUser.status ?? "online",
              lastSeen: rawUser.lastSeen ?? Date.now(),
            };
          }
          setUsers(map);
          return;
        }

        if (!data?.user?.id) return;
        const userId: string = data.user.id;

        switch (action) {
          case "online": {
            setUsers(prev => ({
              ...prev,
              [userId]: {
                id: userId,
                username: data.user.username ?? prev[userId]?.username,
                status: "online",
                lastSeen: Date.now(),
              },
            }));
            break;
          }
          case "offline": {
            setUsers(prev => {
              const copy = { ...prev };
              delete copy[userId];
              return copy;
            });
            break;
          }
          case "status": {
            setUsers(prev => ({
              ...prev,
              [userId]: {
                ...(prev[userId] || { id: userId }),
                username: data.user.username ?? prev[userId]?.username,
                status: data.user.status ?? prev[userId]?.status ?? "online",
                lastSeen: data.user.lastSeen ?? Date.now(),
              },
            }));
            break;
          }
          default:
            break;
        }
      } catch {}
    };

    const cleanup = () => {
      setConnected(false);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      try { ws.close(); } catch {}
      if (wsRef.current === ws) wsRef.current = null;
    };

    ws.onclose = cleanup;
    ws.onerror = cleanup;

    return cleanup;
  }, [token]);

  const setStatus = useCallback((status: PresenceUser["status"]) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!status || status === "offline") return;
    try { ws.send(JSON.stringify({ type: "status", status })); } catch {}
  }, []);

  const onlineList = useMemo(() => Object.values(users), [users]);

  return { connected, users, onlineList, setStatus } as const;
}

type PresenceContextValue = ReturnType<typeof usePresence> & { token?: string };

const PresenceContext = createContext<PresenceContextValue | undefined>(undefined);

const getStoredToken = () => {
  if (typeof window === "undefined") return undefined;
  const value = localStorage.getItem("token");
  return value ?? undefined;
};

export function PresenceProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | undefined>(() => getStoredToken());

  useEffect(() => {
    const syncToken = () => {
      setToken(prev => {
        const next = getStoredToken();
        return prev === next ? prev : next;
      });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "token") return;
      syncToken();
    };

    const handleFocus = () => {
      syncToken();
    };

    const handleTokenChange = () => {
      syncToken();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("token-change", handleTokenChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("token-change", handleTokenChange);
    };
  }, []);

  const { connected, users, onlineList, setStatus } = usePresence(token);

  const value = useMemo(
    () => ({ connected, users, onlineList, setStatus, token }),
    [connected, users, onlineList, setStatus, token]
  );

  return createElement(PresenceContext.Provider, { value }, children);
}

export function usePresenceContext() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresenceContext must be used within a PresenceProvider");
  }
  return context;
}
