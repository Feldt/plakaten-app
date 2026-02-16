import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterPartyDraft {
  orgName: string;
  cvrNumber: string;
  contactName: string;
  email: string;
  phone: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  acceptTerms: boolean;
  logoUri: string | null;
  step: number;
}

interface RegisterPartyState extends RegisterPartyDraft {
  update: (data: Partial<RegisterPartyDraft>) => void;
  reset: () => void;
}

const initialState: RegisterPartyDraft = {
  orgName: '',
  cvrNumber: '',
  contactName: '',
  email: '',
  phone: '',
  streetAddress: '',
  zipCode: '',
  city: '',
  acceptTerms: false,
  logoUri: null,
  step: 0,
};

export const useRegisterPartyStore = create<RegisterPartyState>()(
  persist(
    (set) => ({
      ...initialState,
      update: (data) => set((state) => ({ ...state, ...data })),
      reset: () => set(initialState),
    }),
    {
      name: 'register-party-draft',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
