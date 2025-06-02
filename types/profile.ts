export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileContextData {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  signOut: () => Promise<void>;
} 