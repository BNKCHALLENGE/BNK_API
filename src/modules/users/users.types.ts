export interface UserResponseDto {
  id: string;
  name: string;
  profileImageUrl: string;
  gender?: string;
  age?: number;
  coinBalance: number;
  preferences: {
    categories: string[];
    isOnboardingComplete: boolean;
  };
}
