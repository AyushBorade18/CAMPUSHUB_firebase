'use client';
import { create } from 'zustand';

// This will be our unified item type, matching what we expect from Firestore
type Item = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'buy-sell' | 'borrow-lend' | 'lost-found';
  status: 'available' | 'sold' | 'borrowed' | 'lost' | 'found';
  datePosted: any; // Can be string or Firestore Timestamp
  imageUrl?: string;
  price?: number;
  rate?: string;
  location?: string;
};

interface NotificationsState {
  notifications: Item[];
  addNotification: (item: Item) => void;
  clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (item) =>
    set((state) => {
      // Avoid adding duplicate notifications
      if (state.notifications.some((n) => n.id === item.id)) {
        return state;
      }
      // Add new notification to the beginning of the list
      return { notifications: [item, ...state.notifications] };
    }),
  clearNotifications: () => set({ notifications: [] }),
}));
