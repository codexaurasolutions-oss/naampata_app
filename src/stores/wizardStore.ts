import { create } from 'zustand';

interface WizardState {
  currentStep: number;
  formData: {
    name: string;
    tagline: string;
    businessTypes: string[];
    natureOfBusiness: string;
    operationalStructure: string[];
    categoryId: string;
    targetMarket: string[];
    address: {
      country: string;
      state: string;
      city: string;
      street: string;
      pincode: string;
    };
    location: { lat: number; lng: number };
    contact: { phone: string; whatsapp: string; email: string; website: string };
    businessHours: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
    description: { short: string; full: string };
    experience: { yearEstablished: string; employeeCount: string; priceRange: string; languages: string[] };
    socialLinks: { platform: string; url: string }[];
    amenities: string[];
    industrySubType: string[];
    keywords: string[];
    faqs: { question: string; answer: string }[];
    expansion: { franchiseAvailable: boolean; dealerInquiries: boolean; importerExporter: boolean };
    media: { logoUrl: string; coverUrl: string; gallery: string[] };
  };
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<WizardState['formData']>) => void;
  resetWizard: () => void;
}

const initialFormData: WizardState['formData'] = {
  name: '',
  tagline: '',
  businessTypes: [],
  natureOfBusiness: '',
  operationalStructure: [],
  categoryId: '',
  targetMarket: [],
  address: { country: '', state: '', city: '', street: '', pincode: '' },
  location: { lat: 37.7749, lng: -122.4194 },
  contact: { phone: '', whatsapp: '', email: '', website: '' },
  businessHours: {
    Monday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM' },
    Tuesday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM' },
    Wednesday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM' },
    Thursday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM' },
    Friday: { isOpen: true, openTime: '09:00 AM', closeTime: '05:00 PM' },
    Saturday: { isOpen: false, openTime: '10:00 AM', closeTime: '02:00 PM' },
    Sunday: { isOpen: false, openTime: '10:00 AM', closeTime: '02:00 PM' },
  },
  description: { short: '', full: '' },
  experience: { yearEstablished: '', employeeCount: '', priceRange: '$$', languages: [] },
  socialLinks: [],
  amenities: [],
  industrySubType: [],
  keywords: [],
  faqs: [],
  expansion: { franchiseAvailable: false, dealerInquiries: false, importerExporter: false },
  media: { logoUrl: '', coverUrl: '', gallery: [] },
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  formData: initialFormData,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 20) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  updateFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data } 
  })),
  resetWizard: () => set({ 
    currentStep: 1, 
    formData: initialFormData 
  }),
}));
