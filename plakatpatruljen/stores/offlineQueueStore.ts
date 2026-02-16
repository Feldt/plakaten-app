import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecordPosterLogParams {
  p_task_claim_id: string;
  p_campaign_id: string;
  p_worker_id: string;
  p_type: string;
  p_latitude: number;
  p_longitude: number;
  p_photo_url: string;
  p_address: string | null;
  p_notes: string | null;
  p_rule_violations: string[];
}

export interface PendingPosterLog {
  id: string;
  photoUri: string;
  rpcParams: RecordPosterLogParams;
  createdAt: string;
  retryCount: number;
}

interface OfflineQueueState {
  pendingLogs: PendingPosterLog[];
  isRetrying: boolean;
  addPending: (log: PendingPosterLog) => void;
  removePending: (id: string) => void;
  incrementRetry: (id: string) => void;
  setRetrying: (isRetrying: boolean) => void;
  clear: () => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set) => ({
      pendingLogs: [],
      isRetrying: false,
      addPending: (log) =>
        set((state) => ({ pendingLogs: [...state.pendingLogs, log] })),
      removePending: (id) =>
        set((state) => ({
          pendingLogs: state.pendingLogs.filter((l) => l.id !== id),
        })),
      incrementRetry: (id) =>
        set((state) => ({
          pendingLogs: state.pendingLogs.map((l) =>
            l.id === id ? { ...l, retryCount: l.retryCount + 1 } : l,
          ),
        })),
      setRetrying: (isRetrying) => set({ isRetrying }),
      clear: () => set({ pendingLogs: [], isRetrying: false }),
    }),
    {
      name: 'offline-poster-queue',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
