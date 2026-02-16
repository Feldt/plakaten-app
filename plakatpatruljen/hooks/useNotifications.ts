import { useCallback, useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/supabase/queries/notifications';

export function useNotifications(userId: string) {
  const {
    notifications,
    unreadCount,
    isLoading,
    setNotifications,
    markRead,
    markAllRead,
    setLoading,
  } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const result = await getNotifications(userId);
    if (result.success) {
      setNotifications(result.data);
    }
  }, [userId, setNotifications, setLoading]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      markRead(id);
      await markNotificationRead(id);
    },
    [markRead],
  );

  const handleMarkAllRead = useCallback(async () => {
    markAllRead();
    await markAllNotificationsRead(userId);
  }, [userId, markAllRead]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    refetch: fetchNotifications,
  };
}
