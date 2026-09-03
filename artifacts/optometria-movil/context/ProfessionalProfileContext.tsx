import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ProfessionalProfile = {
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  licenseNumber: string;
  specialty: string;
  country: string;
  officeName: string;
  officeAddress: string;
  officePhone: string;
  officeEmail: string;
  prescriptionName: string;
  prescriptionProfessionalName: string;
  prescriptionLicense: string;
  prescriptionPhone: string;
  prescriptionEmail: string;
  prescriptionAddress: string;
  logoUri?: string;
  signatureUri?: string;
};

const STORAGE_KEY = '@nexus/professional-profile';

export const emptyProfessionalProfile: ProfessionalProfile = {
  firstName: '',
  lastName: '',
  email: '',
  profession: 'Optometrista',
  licenseNumber: '',
  specialty: '',
  country: 'México',
  officeName: '',
  officeAddress: '',
  officePhone: '',
  officeEmail: '',
  prescriptionName: '',
  prescriptionProfessionalName: '',
  prescriptionLicense: '',
  prescriptionPhone: '',
  prescriptionEmail: '',
  prescriptionAddress: '',
};

type ProfessionalProfileContextValue = {
  profile: ProfessionalProfile;
  isLoading: boolean;
  updateProfile: (changes: Partial<ProfessionalProfile>) => void;
};

const ProfessionalProfileContext = createContext<ProfessionalProfileContextValue | null>(null);

export function ProfessionalProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfessionalProfile>(emptyProfessionalProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setProfile({ ...emptyProfessionalProfile, ...(JSON.parse(stored) as Partial<ProfessionalProfile>) });
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => undefined);
  }, [isLoading, profile]);

  const value = useMemo(() => ({
    profile,
    isLoading,
    updateProfile: (changes: Partial<ProfessionalProfile>) => setProfile((current) => ({ ...current, ...changes })),
  }), [isLoading, profile]);

  return <ProfessionalProfileContext.Provider value={value}>{children}</ProfessionalProfileContext.Provider>;
}

export function useProfessionalProfile() {
  const context = useContext(ProfessionalProfileContext);
  if (!context) throw new Error('useProfessionalProfile must be used inside ProfessionalProfileProvider');
  return context;
}