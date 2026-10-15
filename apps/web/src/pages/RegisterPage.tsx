import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please provide your full name");
      return;
    }
    if (!email.includes("@")) {
      setError("Please provide a valid email");
      return;
    }
    if (mobile.length < 10) {
      setError("Please enter a 10-digit mobile number");
      return;
    }
    if (password.length < 6) {
      setError("Password must have at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept terms and conditions");
      return;
    }

    register(fullName, email, mobile);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[85vh] bg-[#F8F5ED] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#E5DFD3] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED] mx-auto shadow-xs">
            <Leaf className="w-6 h-6 text-[#A9B7A0]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#183F32]">
            Create Customer Account
          </h1>
          <p className="text-xs text-[#77796F]">
            Join Tulsi Swaraj for unified order tracking and wellness updates.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                placeholder="Aarav Sharma"
              />
              <User className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                placeholder="name@example.in"
              />
              <Mail className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">
              Mobile Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                placeholder="10-digit mobile"
              />
              <Phone className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
              />
              <Lock className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#77796F] hover:text-[#183F32]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-[#77796F] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#183F32]"
              />
              <span>
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="underline font-semibold text-[#183F32]"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  className="underline font-semibold text-[#183F32]"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#183F32] text-[#F8F5ED] rounded-md text-sm font-semibold hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
          >
            Create My Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5DFD3] text-center text-xs text-[#77796F]">
          <span>Already registered? </span>
          <Link
            to="/login"
            className="font-semibold text-[#183F32] hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
