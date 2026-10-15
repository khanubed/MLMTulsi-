import React from "react";
import { POLICIES_DATA } from "../data/policiesData";
import { FileText, AlertTriangle } from "lucide-react";

export const TermsPage: React.FC = () => {
  const policy = POLICIES_DATA.terms;

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#E5DFD3] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#285642] font-semibold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Customer Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#183F32]">
            {policy.title}
          </h1>
          <p className="text-xs text-[#77796F]">
            Last updated: {policy.lastUpdated}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#EFE9DB] border border-[#B49A63]/60 flex items-start gap-3 text-xs text-[#252923]">
          <AlertTriangle className="w-5 h-5 text-[#B49A63] shrink-0 mt-0.5" />
          <p>
            <strong>Important Regulatory Notice:</strong> These terms govern use
            of the Tulsi Swaraj online storefront for Tulsi Meta Ved Herbal Mix
            (₹500). Any referral reward simulations shown inside customer
            dashboards are non-contractual prototype previews.
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
