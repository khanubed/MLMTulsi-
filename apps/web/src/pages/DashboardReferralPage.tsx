import React, { useState } from "react";
import { Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const DashboardReferralPage: React.FC = () => {
  const { referralData } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Prominent Disclaimer Banner */}
      <div className="p-5 rounded-lg bg-[#EFE9DB] border-2 border-[#B49A63] space-y-2">
        <div className="flex items-center gap-2 text-[#183F32] font-serif font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-[#B49A63] shrink-0" />
          <span>Private Member Feature — Prototype Demonstration</span>
        </div>
        <p className="text-xs text-[#252923] leading-relaxed">
          This referral preview is accessible solely inside your private
          customer dashboard and is not advertised on the public storefront. All
          milestone figures (such as ₹500 reward after 3 qualifying referrals)
          are demonstration parameters subject to final commercial review.{" "}
          <strong>Earnings are neither guaranteed nor automatic.</strong>
        </p>
      </div>

      <div className="border-b border-[#E5DFD3] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#183F32]">
            Customer Referral Program (Demo)
          </h2>
          <p className="text-xs text-[#77796F] mt-0.5">
            Share pure Ayurvedic botanical living with your network and track
            qualification milestones.
          </p>
        </div>

        <span className="text-xs bg-[#285642] text-[#F8F5ED] px-3 py-1 rounded-full font-semibold">
          Status: Active Prototype Member
        </span>
      </div>

      {/* Referral Link & Member ID Card */}
      <div className="p-6 bg-[#F8F5ED] rounded-xl border border-[#E5DFD3] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-[#77796F] uppercase font-semibold">
              Member Referral Code
            </span>
            <p className="text-xl font-serif font-bold text-[#183F32]">
              {referralData.memberCode}
            </p>
          </div>
          <span className="text-xs text-[#77796F]">
            Applies to verified orders of Tulsi Meta Ved Herbal Mix (₹500)
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#183F32]">
            Your Demo Referral Link
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={referralData.referralLink}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#A9B7A0] bg-white text-xs font-mono text-[#252923]"
            />
            <button
              onClick={handleCopyLink}
              className="px-5 py-2.5 min-h-[42px] bg-[#183F32] text-[#F8F5ED] rounded-xl text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A9B7A0]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Milestone Progress Card */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B49A63]">
              Milestone Tracker
            </span>
            <h3 className="font-serif text-lg font-bold text-[#183F32]">
              3 Qualifying Referrals Milestone
            </h3>
          </div>
          <span className="text-sm font-serif font-bold text-[#183F32]">
            {referralData.qualifiedCount} / {referralData.milestoneTarget} Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5DFD3] rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#183F32] h-full rounded-full transition-all duration-500"
            style={{ width: `${(referralData.qualifiedCount / referralData.milestoneTarget) * 100}%` }}
          />
        </div>

        <p className="text-xs text-[#77796F] leading-relaxed">
          1 more verified customer order required to unlock the simulated ₹{referralData.milestoneRewardAmount} reward milestone.
        </p>

        {/* Metric breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2 text-center text-xs">
          <div className="p-3 bg-[#F8F5ED] rounded-xl border border-[#E5DFD3]">
            <span className="text-[#77796F] block">Total Invites</span>
            <strong className="text-base font-serif text-[#183F32]">{referralData.totalReferred}</strong>
          </div>
          <div className="p-3 bg-[#F8F5ED] rounded-xl border border-[#E5DFD3]">
            <span className="text-[#77796F] block">Qualified Orders</span>
            <strong className="text-base font-serif text-[#285642]">{referralData.qualifiedCount}</strong>
          </div>
          <div className="p-3 bg-[#F8F5ED] rounded-xl border border-[#E5DFD3]">
            <span className="text-[#77796F] block">Milestone Reward</span>
            <strong className="text-base font-serif text-[#183F32]">₹{referralData.milestoneRewardAmount}</strong>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="space-y-3">
        <h3 className="font-serif text-base font-bold text-[#183F32]">
          Referred Customer History
        </h3>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden space-y-2.5">
          {referralData.rewardsHistory.map((ref) => (
            <div key={ref.id} className="p-3.5 rounded-xl bg-[#F8F5ED] border border-[#E5DFD3] space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#183F32]">{ref.refereeName}</span>
                <span className="px-2 py-0.5 rounded bg-[#285642]/10 text-[#285642] font-semibold text-[10px]">
                  {ref.status}
                </span>
              </div>
              <p className="text-[#77796F] text-[11px]">{ref.date} • Milestone in Progress (2/3)</p>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto border border-[#E5DFD3] rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F5ED] border-b border-[#E5DFD3] text-[#77796F]">
              <tr>
                <th className="py-3 px-4">Referee Name</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Reward Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD3] bg-white">
              {referralData.rewardsHistory.map((ref) => (
                <tr key={ref.id}>
                  <td className="py-3.5 px-4 font-semibold text-[#183F32]">{ref.refereeName}</td>
                  <td className="py-3.5 px-4 text-[#77796F]">{ref.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#285642]/10 text-[#285642] font-semibold text-[10px]">
                      {ref.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#77796F]">
                    Milestone in Progress (2/3)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program Terms & Qualification Rules */}
      <div className="p-5 rounded-lg bg-[#F8F5ED] border border-[#E5DFD3] space-y-2 text-xs text-[#77796F]">
        <h4 className="font-serif font-bold text-[#183F32] text-sm">
          Qualification & Settlement Rules (Draft Preview)
        </h4>
        <ul className="list-disc pl-4 space-y-1 leading-relaxed">
          <li>
            A referral qualifies only after the referred recipient completes
            delivery without initiating a return within the 7-day protocol
            window.
          </li>
          <li>
            Self-referrals or duplicate account creation under identical
            mobile/address records are filtered.
          </li>
          <li>
            All reward disbursement mechanisms and additional commission tiers
            remain subject to final regulatory approval and company policy
            configuration.
          </li>
        </ul>
      </div>
    </div>
  );
};
