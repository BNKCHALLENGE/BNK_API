export interface UserResponseDto {
  id: string;
  name: string;
  profileImageUrl: string;
  gender?: string;
  age?: number;
  acceptanceRate: number;
  activeTimeSlot: string;
  coinBalance: number;
  preferences: {
    categories: string[];
    isOnboardingComplete: boolean;
  };
}
