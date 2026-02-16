import { create } from 'zustand';

interface NotificationState {
  notifications: Record<string, unknown>[];
  unreadCount: number;
  pushToken: string | null;
  isLoading: boolean;
  setNotifications: (notifications: Record<string, unknown>[]) => void;
  addNotification: (notification: Record<string, unknown>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setPushToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  pushToken: null,
  isLoading: false,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !(n as { read: boolean }).read).length,
      isLoading: false,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        (n as { id: string }).id === id ? { ...n, read: true } : n,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !(n as { read: boolean }).read).length,
      };
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  setPushToken: (pushToken) => set({ pushToken }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () =>
    set({
      notifications: [],
      unreadCount: 0,
      pushToken: null,
      isLoading: false,
    }),
}));
