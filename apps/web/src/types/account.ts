import type { Order, ShippingAddress } from './order';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  registeredDate: string;
  defaultAddress?: ShippingAddress;
}

export interface ReferralReward {
  id: string;
  refereeName: string;
  date: string;
  status: 'Pending Verification' | 'Qualified' | 'Credited';
  rewardAmount: number; // ₹500 milestone after 3 qualifying referrals
}

export interface ReferralProgramState {
  isActive: boolean;
  memberCode: string;
  referralLink: string;
  totalReferred: number;
  qualifiedCount: number;
  milestoneTarget: number; // 3
  milestoneRewardAmount: number; // 500
  pendingRewards: number;
  approvedRewards: number;
  rewardsHistory: ReferralReward[];
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  orders: Order[];
  referralData: ReferralProgramState;
  login: (email: string, fullName?: string) => void;
  register: (fullName: string, email: string, mobile: string) => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  addOrder: (order: Order) => void;
  activateReferralProgram: () => void;
}
