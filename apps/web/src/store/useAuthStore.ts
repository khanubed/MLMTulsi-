import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, UserProfile } from '../types/account';
import type { Order } from '../types/order';
import { FLAGSHIP_PRODUCT } from '../data/productData';

const INITIAL_USER: UserProfile = {
  id: 'usr-001',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@example.in',
  mobile: '+91 98765 43210',
  registeredDate: 'September 2026',
  defaultAddress: {
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.in',
    mobile: '+91 98765 43210',
    houseFlat: 'B-402, Green Meadows',
    streetLocality: 'Indiranagar 100ft Road',
    landmark: 'Near BDA Complex',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560038',
    country: 'India'
  }
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'TS-2026-8491',
    date: '02 Oct 2026',
    items: [
      {
        product: FLAGSHIP_PRODUCT,
        quantity: 1
      }
    ],
    subtotal: 500,
    shippingFee: 0,
    total: 500,
    paymentMethod: 'upi',
    paymentStatus: 'Simulated Paid',
    orderStatus: 'Delivered',
    deliveryEstimate: 'Delivered on 06 Oct 2026',
    shippingAddress: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.in',
      mobile: '+91 98765 43210',
      houseFlat: 'B-402, Green Meadows',
      streetLocality: 'Indiranagar 100ft Road',
      landmark: 'Near BDA Complex',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
      country: 'India'
    },
    isDemoOrder: true
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      isAuthenticated: true,
      orders: INITIAL_ORDERS,
      referralData: {
        isActive: true,
        memberCode: 'TS-MEM-842',
        referralLink: 'https://tulsiswaraj.example.in/ref/TS-MEM-842',
        totalReferred: 2,
        qualifiedCount: 2,
        milestoneTarget: 3,
        milestoneRewardAmount: 500,
        pendingRewards: 0,
        approvedRewards: 0,
        rewardsHistory: [
          {
            id: 'ref-1',
            refereeName: 'Rohan Verma',
            date: '04 Oct 2026',
            status: 'Qualified',
            rewardAmount: 0 // milestone pending 3rd referral
          },
          {
            id: 'ref-2',
            refereeName: 'Meera Nair',
            date: '11 Oct 2026',
            status: 'Qualified',
            rewardAmount: 0 // milestone pending 3rd referral
          }
        ]
      },

      login: (email: string, fullName = 'Demo Customer') => {
        set({
          isAuthenticated: true,
          user: {
            id: 'usr-' + Date.now().toString().slice(-4),
            fullName: fullName || 'Demo Customer',
            email,
            mobile: '+91 98765 43210',
            registeredDate: 'October 2026',
            defaultAddress: get().user?.defaultAddress || INITIAL_USER.defaultAddress
          }
        });
      },

      register: (fullName: string, email: string, mobile: string) => {
        set({
          isAuthenticated: true,
          user: {
            id: 'usr-' + Date.now().toString().slice(-4),
            fullName,
            email,
            mobile,
            registeredDate: 'October 2026'
          }
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null
        });
      },

      updateProfile: (updated: Partial<UserProfile>) => {
        if (!get().user) return;
        set({
          user: {
            ...get().user!,
            ...updated
          }
        });
      },

      addOrder: (order: Order) => {
        set({
          orders: [order, ...get().orders]
        });
      },

      activateReferralProgram: () => {
        set({
          referralData: {
            ...get().referralData,
            isActive: true
          }
        });
      }
    }),
    {
      name: 'tulsi_swaraj_auth'
    }
  )
);
