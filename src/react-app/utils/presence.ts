import { useEffect, useMemo, useRef, useState } from "react";

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
    if (!token) return;
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
        if (data?.type !== "presence") return;
        if (data.action === "snapshot" && Array.isArray(data.users)) {
          const map: Record<string, PresenceUser> = {};
          for (const u of data.users) {
            map[u.id] = u;
          }
          setUsers(map);
        } else if (data.action === "online" && data.user?.id) {
          setUsers(prev => ({
            ...prev,
            [data.user.id]: {
              id: data.user.id,
              username: data.user.username,
              status: "online",
              lastSeen: Date.now()
            }
          }));
        } else if (data.action === "offline" && data.user?.id) {
          setUsers(prev => {
            const copy = { ...prev };
            delete copy[data.user.id];
            return copy;
          });
        } else if (data.action === "status" && data.user?.id) {
          setUsers(prev => ({
            ...prev,
            [data.user.id]: {
              ...(prev[data.user.id] || { id: data.user.id }),
              status: data.user.status ?? "online",
              lastSeen: data.user.lastSeen ?? Date.now(),
              username: prev[data.user.id]?.username
            }
          }));
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

  const setStatus = (status: PresenceUser["status"]) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (!status || status === "offline") return;
    try { ws.send(JSON.stringify({ type: "status", status })); } catch {}
  };

  const onlineList = useMemo(() => Object.values(users), [users]);

  return { connected, users, onlineList, setStatus } as const;
}
