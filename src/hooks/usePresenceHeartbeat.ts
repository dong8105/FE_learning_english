import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export function usePresenceHeartbeat(currentTab: string = 'home') {
  const { user, getAuthHeaders } = useAuth();
  const [isHeartbeatActive, setIsHeartbeatActive] = useState<boolean>(true);
  const [lastPingTime, setLastPingTime] = useState<number>(Date.now());
  const sessionIdRef = useRef<string>('');

  // Lấy hoặc tạo sessionId duy nhất cho tab/phiên duyệt hiện tại
  useEffect(() => {
    let sid = sessionStorage.getItem('bluebell_presence_sid');
    if (!sid) {
      sid = `sid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('bluebell_presence_sid', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  const sendHeartbeat = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const res = await fetch(`${API_BASE_URL}/api/presence/heartbeat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          currentTab,
          timestamp: Date.now()
        })
      });

      if (res.ok) {
        setLastPingTime(Date.now());
        setIsHeartbeatActive(true);
      }
    } catch {
      // Yên lặng bỏ qua lỗi kết nối tạm thời để không ảnh hưởng đến trải nghiệm học
      setIsHeartbeatActive(false);
    }
  };

  // Gửi heartbeat định kỳ mỗi 15 giây
  useEffect(() => {
    sendHeartbeat();

    const intervalId = setInterval(() => {
      sendHeartbeat();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [currentTab, user]);

  // Gửi heartbeat tức thì khi người dùng quay lại tab trình duyệt
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [currentTab]);

  return { isHeartbeatActive, lastPingTime, sessionId: sessionIdRef.current };
}
