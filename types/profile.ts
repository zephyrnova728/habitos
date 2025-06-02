export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileContextData {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  signOut: () => Promise<void>;
} 