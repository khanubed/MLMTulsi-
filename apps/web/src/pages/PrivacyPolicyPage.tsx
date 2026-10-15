import React from "react";
import { POLICIES_DATA } from "../data/policiesData";
import { Lock } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => {
  const policy = POLICIES_DATA.privacy;

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#E5DFD3] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#285642] font-semibold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#183F32]">
            {policy.title}
          </h1>
          <p className="text-xs text-[#77796F]">
            Last updated: {policy.lastUpdated}
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 border border-[#E5DFD3] shadow-xs space-y-8">
          {policy.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-[#183F32]">
                {sec.heading}
              </h2>
              <p className="text-xs sm:text-sm text-[#77796F] leading-relaxed">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
