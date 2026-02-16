import { create } from 'zustand';
import type { CampaignFormStep } from '@/types/campaign';

interface PickupLocationDraft {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  availablePosters: number;
  openHours: string;
}

interface ZoneDraft {
  name: string;
  coordinates: number[][][];
  posterCount: number;
}

interface ContactDraft {
  name: string;
  phone: string;
  email: string;
}

interface BasicDraft {
  title: string;
  electionType: 'kommunal' | 'regional' | 'folketings' | 'europa';
  electionDate: string;
  electionCalledDate: string;
  description: string;
}

interface BudgetDraft {
  posterCount: number;
  pricePerPosterHang: number;
  pricePerPosterRemove: number;
}

const STEPS: CampaignFormStep[] = ['basic', 'budget', 'zones', 'pickup', 'contact', 'review'];

interface CreateCampaignState {
  currentStep: number;
  formData: {
    basic: BasicDraft;
    budget: BudgetDraft;
    zones: ZoneDraft[];
    pickupLocations: PickupLocationDraft[];
    contact: ContactDraft;
  };
  isDirty: boolean;
  draftId: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBasic: (data: Partial<BasicDraft>) => void;
  updateBudget: (data: Partial<BudgetDraft>) => void;
  addZone: (zone: ZoneDraft) => void;
  removeZone: (index: number) => void;
  addPickupLocation: (location: PickupLocationDraft) => void;
  removePickupLocation: (index: number) => void;
  updateContact: (data: Partial<ContactDraft>) => void;
  reset: () => void;
  setDraftId: (id: string | null) => void;
}

const initialFormData = {
  basic: {
    title: '',
    electionType: 'kommunal' as const,
    electionDate: '',
    electionCalledDate: '',
    description: '',
  },
  budget: {
    posterCount: 0,
    pricePerPosterHang: 15,
    pricePerPosterRemove: 10,
  },
  zones: [] as ZoneDraft[],
  pickupLocations: [] as PickupLocationDraft[],
  contact: {
    name: '',
    phone: '',
    email: '',
  },
};

export const useCreateCampaignStore = create<CreateCampaignState>((set, get) => ({
  currentStep: 0,
  formData: { ...initialFormData },
  isDirty: false,
  draftId: null,

  setStep: (step) => set({ currentStep: Math.max(0, Math.min(step, STEPS.length - 1)) }),
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < STEPS.length - 1) set({ currentStep: currentStep + 1 });
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },
  updateBasic: (data) =>
    set((state) => ({
      formData: { ...state.formData, basic: { ...state.formData.basic, ...data } },
      isDirty: true,
    })),
  updateBudget: (data) =>
    set((state) => ({
      formData: { ...state.formData, budget: { ...state.formData.budget, ...data } },
      isDirty: true,
    })),
  addZone: (zone) =>
    set((state) => ({
      formData: { ...state.formData, zones: [...state.formData.zones, zone] },
      isDirty: true,
    })),
  removeZone: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        zones: state.formData.zones.filter((_, i) => i !== index),
      },
      isDirty: true,
    })),
  addPickupLocation: (location) =>
    set((state) => ({
      formData: {
        ...state.formData,
        pickupLocations: [...state.formData.pickupLocations, location],
      },
      isDirty: true,
    })),
  removePickupLocation: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        pickupLocations: state.formData.pickupLocations.filter((_, i) => i !== index),
      },
      isDirty: true,
    })),
  updateContact: (data) =>
    set((state) => ({
      formData: { ...state.formData, contact: { ...state.formData.contact, ...data } },
      isDirty: true,
    })),
  reset: () => set({ currentStep: 0, formData: { ...initialFormData, zones: [], pickupLocations: [] }, isDirty: false, draftId: null }),
  setDraftId: (id) => set({ draftId: id }),
}));

// Derived selectors
export function getCompletedSteps(state: CreateCampaignState): boolean[] {
  const { formData } = state;
  return [
    formData.basic.title.length >= 3 && formData.basic.electionDate.length > 0,
    formData.budget.posterCount > 0,
    formData.zones.length > 0,
    formData.pickupLocations.length > 0,
    formData.contact.name.length >= 2 && formData.contact.phone.length > 0 && formData.contact.email.length > 0,
    false, // Review step is never "completed" — it's the publish action
  ];
}

export function canPublish(state: CreateCampaignState): boolean {
  const completed = getCompletedSteps(state);
  return completed.slice(0, 5).every(Boolean);
}

export const CAMPAIGN_FORM_STEPS = STEPS;
