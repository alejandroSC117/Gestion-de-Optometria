import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfessionalProfile as updateProfileRequest } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';

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
  error: string | null;
  updateProfile: (changes: Partial<ProfessionalProfile>) => Promise<void>;
};

const ProfessionalProfileContext = createContext<ProfessionalProfileContextValue | null>(null);

export function ProfessionalProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfessionalProfile>(emptyProfessionalProfile);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ['clinic', 'profile', user?.id],
    queryFn: () => getCurrentUser(),
    enabled: Boolean(user?.id),
    retry: false,
  });
  const isLoading = Boolean(user?.id) && profileQuery.isLoading;

  useEffect(() => {
    setProfile(emptyProfessionalProfile);
  }, [user?.id]);

  useEffect(() => {
    if (!profileQuery.data) return;
    const nameParts = (user?.name ?? '').trim().split(/\s+/).filter(Boolean);
    setProfile({
      ...emptyProfessionalProfile,
      ...profileQuery.data,
      firstName: profileQuery.data.firstName || nameParts[0] || '',
      lastName: profileQuery.data.lastName || nameParts.slice(1).join(' '),
      email: profileQuery.data.email || user?.email || '',
    });
  }, [profileQuery.data, user?.email, user?.name]);

  const value = useMemo(() => ({
    profile,
    isLoading,
    error: profileQuery.error instanceof Error ? profileQuery.error.message : null,
    updateProfile: async (changes: Partial<ProfessionalProfile>) => {
      if (!user?.id) throw new Error('Inicia sesión para guardar tu perfil profesional.');
      const updated = await updateProfileRequest({ ...profile, ...changes });
      setProfile({ ...emptyProfessionalProfile, ...updated });
      queryClient.setQueryData(['clinic', 'profile', user.id], updated);
    },
  }), [isLoading, profile, profileQuery.error, queryClient, user?.id]);

  return <ProfessionalProfileContext.Provider value={value}>{children}</ProfessionalProfileContext.Provider>;
}

export function useProfessionalProfile() {
  const context = useContext(ProfessionalProfileContext);
  if (!context) throw new Error('useProfessionalProfile must be used inside ProfessionalProfileProvider');
  return context;
}