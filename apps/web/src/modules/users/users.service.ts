export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: string;
  status: string;
}

export class UsersService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    return {
      id: userId,
      fullName: 'Tulsi Swaraj Member',
      phone: '+919876543210',
      role: 'MEMBER',
      status: 'ACTIVE',
    };
  }
}
