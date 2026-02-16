import { create } from 'zustand';
import type { Campaign } from '@/types/campaign';

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    electionType?: string;
    search?: string;
  };
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  setSelectedCampaignId: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: CampaignState['filters']) => void;
  clear: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  selectedCampaignId: null,
  isLoading: false,
  error: null,
  filters: {},
  setCampaigns: (campaigns) => set({ campaigns, isLoading: false, error: null }),
  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),
  setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setFilters: (filters) => set({ filters }),
  clear: () =>
    set({
      campaigns: [],
      selectedCampaignId: null,
      isLoading: false,
      error: null,
      filters: {},
    }),
}));
