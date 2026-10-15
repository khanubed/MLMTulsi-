import React from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F5ED]">
      {/* Editorial Hero Header */}
      <section className="py-16 sm:py-20 border-b border-[#E5DFD3] bg-[#EFE9DB]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B49A63]">
            Our Story & Heritage
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#183F32] font-bold leading-tight">
            The Living Spirit of Indian Botanicals
          </h1>
          <p className="text-base sm:text-lg text-[#77796F] max-w-2xl mx-auto leading-relaxed">
            Tulsi Swaraj was created from a quiet conviction: that the sacred
            botanical knowledge of India belongs at the center of honest,
            unadorned everyday life.
          </p>
        </div>
      </section>

      {/* Cinematic Banner */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl overflow-hidden border border-[#E5DFD3] shadow-lg aspect-16/9 sm:aspect-21/9 bg-[#EFE9DB]">
            <img
              src="/images/brand_story.jpg"
              alt="Artisanal mortar and pestle with fresh tulsi leaves"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-16 border-b border-[#E5DFD3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm sm:text-base text-[#252923] leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-3xl font-serif text-[#183F32] font-bold">
              Rooted in Humility, Not Slogans
            </h2>
            <p>
              Across Indian households for millennia, the Tulsi shrub has held a
              sanctified courtyard space. It was never treated merely as a
              commodity; it represented morning gratitude, respiratory
              cleansing, and the gentle harmonic balance of body and mind.
            </p>
            <p>
              In contemporary commercial wellness, however, ancient herbs are
              frequently obscured behind synthetic fillers, hyper-marketed
              miracles, or multi-tiered sales rhetoric.{" "}
              <strong>Tulsi Swaraj rejects this distortion.</strong>
            </p>
          </div>

          {/* Three Core Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-[#E5DFD3]">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-md bg-[#183F32] text-[#F8F5ED] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#183F32]">
                Botanical Purity
              </h3>
              <p className="text-xs text-[#77796F]">
                Focused formulation utilizing whole herbs and traditional
                shade-drying methods.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-md bg-[#183F32] text-[#F8F5ED] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#183F32]">
                Clear Ethics
              </h3>
              <p className="text-xs text-[#77796F]">
                No invented medical claims or counterfeit certificates. Absolute
                transparency.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-md bg-[#183F32] text-[#F8F5ED] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#A9B7A0]" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#183F32]">
                Honest Value
              </h3>
              <p className="text-xs text-[#77796F]">
                Priced accessibly at ₹500 so everyday wellness can remain
                sustained and uncompromised.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-[#183F32] font-bold">
              Our Flagship Focus: Tulsi Meta Ved Herbal Mix
            </h2>
            <p>
              Rather than overwhelming visitors with dozens of catalog
              variations, we channel all our artisanal devotion into perfected
              batch preparations of Tulsi Meta Ved Herbal Mix.
            </p>
            <p>
              Whether prepared with hot spring water at sunrise or sipped after
              sunset, it offers a grounded moment of self-care and renewal.
            </p>
          </div>

          {/* Call to action card */}
          <div className="p-8 rounded-xl bg-[#EFE9DB] border border-[#A9B7A0] flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-serif text-xl font-bold text-[#183F32]">
                Experience Tulsi Meta Ved
              </h3>
              <p className="text-xs text-[#77796F]">
                Offered at ₹500 with complimentary delivery across India.
              </p>
            </div>

            <button
              onClick={() => navigate("/products/tulsi-meta-ved-herbal-mix")}
              className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-md text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              Discover the Blend
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
