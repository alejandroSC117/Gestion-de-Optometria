import { create } from 'zustand';

interface UIStore {
  isDarkMode: boolean;
  showNotification: boolean;
  notificationMessage: string;
  notificationType: 'success' | 'error' | 'warning' | 'info';

  toggleDarkMode: () => void;
  showNotif: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideNotif: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDarkMode: false,
  showNotification: false,
  notificationMessage: '',
  notificationType: 'info',

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  showNotif: (message, type) =>
    set({ showNotification: true, notificationMessage: message, notificationType: type }),
  hideNotif: () => set({ showNotification: false }),
}));
