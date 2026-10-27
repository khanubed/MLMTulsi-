import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Control Center | Tulsi Swaraj',
  description: 'Tulsi Swaraj platform operations, ID approvals, commissions, and order management.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C2826] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-[#E8E1D5] pb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#B49A63] uppercase">
                Operations & Governance
              </span>
              <h1 className="text-3xl font-bold text-[#183F32] font-heading mt-1">
                Admin Control Center
              </h1>
              <p className="text-sm text-[#5D6B66] mt-1">
                Manage network IDs, audit commissions, review withdrawals, and monitor orders.
              </p>
            </div>
            <Link
              href="/"
              className="text-xs font-medium text-[#183F32] hover:text-[#B49A63] transition-colors border border-[#E8E1D5] rounded-lg px-3 py-1.5 bg-white"
            >
              Return to Store
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-[#E8E1D5] shadow-xs">
            <span className="text-xs font-medium text-[#5D6B66]">Network IDs Active</span>
            <div className="text-2xl font-bold text-[#183F32] mt-1 font-heading">--</div>
            <span className="text-[11px] text-[#B49A63] mt-2 block">10-Level Hierarchy Engine</span>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E1D5] shadow-xs">
            <span className="text-xs font-medium text-[#5D6B66]">Pending Orders</span>
            <div className="text-2xl font-bold text-[#183F32] mt-1 font-heading">--</div>
            <span className="text-[11px] text-[#5D6B66] mt-2 block">PhonePe Settlement Status</span>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E1D5] shadow-xs">
            <span className="text-xs font-medium text-[#5D6B66]">Held Rewards</span>
            <div className="text-2xl font-bold text-[#183F32] mt-1 font-heading">₹0.00</div>
            <span className="text-[11px] text-amber-700 mt-2 block">Awaiting Admin Confirmation</span>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E1D5] shadow-xs">
            <span className="text-xs font-medium text-[#5D6B66]">Pending Withdrawals</span>
            <div className="text-2xl font-bold text-[#183F32] mt-1 font-heading">₹0.00</div>
            <span className="text-[11px] text-[#5D6B66] mt-2 block">Gated by 100% Level Completion</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-[#183F32] font-heading mb-4">
            System Modules & Operational Endpoints
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-[#F8F5ED]/60 border border-[#E8E1D5]">
              <span className="font-semibold text-[#183F32]">Network & Hierarchy</span>
              <p className="text-xs text-[#5D6B66] mt-1">
                Inspect 10-level tree positions, ternary child allocations (3 max), and self-referrals.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F5ED]/60 border border-[#E8E1D5]">
              <span className="font-semibold text-[#183F32]">Commission Approvals</span>
              <p className="text-xs text-[#5D6B66] mt-1">
                Review held rewards, verify level completion rules, and post approved earnings to user wallet ledgers.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F5ED]/60 border border-[#E8E1D5]">
              <span className="font-semibold text-[#183F32]">Withdrawal Queue</span>
              <p className="text-xs text-[#5D6B66] mt-1">
                Authorize bank payouts once entire level completions and KYC requirements are confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
