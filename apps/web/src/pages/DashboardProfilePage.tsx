import React, { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const DashboardProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");

  const [houseFlat, setHouseFlat] = useState(
    user?.defaultAddress?.houseFlat || "",
  );
  const [streetLocality, setStreetLocality] = useState(
    user?.defaultAddress?.streetLocality || "",
  );
  const [landmark, setLandmark] = useState(
    user?.defaultAddress?.landmark || "",
  );
  const [city, setCity] = useState(user?.defaultAddress?.city || "");
  const [state, setState] = useState(user?.defaultAddress?.state || "");
  const [pinCode, setPinCode] = useState(user?.defaultAddress?.pinCode || "");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      email,
      mobile,
      defaultAddress: {
        fullName,
        email,
        mobile,
        houseFlat,
        streetLocality,
        landmark,
        city,
        state,
        pinCode,
        country: "India",
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#183F32]">
          My Profile & Saved Address
        </h2>
        <p className="text-xs text-[#77796F] mt-0.5">
          Manage your personal details and primary domestic shipping address.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-md bg-[#EFE9DB] border border-[#285642] flex items-center gap-2 text-xs text-[#183F32] font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#285642]" />
          <span>Profile and address changes saved locally!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#183F32] uppercase tracking-wider">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                Mobile
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4 pt-4 border-t border-[#E5DFD3]">
          <h3 className="text-sm font-semibold text-[#183F32] uppercase tracking-wider">
            Primary Delivery Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                House / Flat / Building
              </label>
              <input
                type="text"
                value={houseFlat}
                onChange={(e) => setHouseFlat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                Street / Locality
              </label>
              <input
                type="text"
                value={streetLocality}
                onChange={(e) => setStreetLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                PIN Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#77796F]">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-md text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};
