import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Leaf, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("aarav.sharma@example.in");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    login(email, "Aarav Sharma");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] bg-[#F8F5ED] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#E5DFD3] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED] mx-auto shadow-xs">
            <Leaf className="w-6 h-6 text-[#A9B7A0]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#183F32]">
            Welcome to Tulsi Swaraj
          </h1>
          <p className="text-xs text-[#77796F]">
            Sign in to track orders, access your wellness preferences, and
            manage account details.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                placeholder="name@example.in"
              />
              <Mail className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#183F32]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#285642] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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

          <button
            type="submit"
            className="w-full py-3.5 bg-[#183F32] text-[#F8F5ED] rounded-md text-sm font-semibold hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            Sign In to Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5DFD3] text-center text-xs text-[#77796F]">
          <span>New to Tulsi Swaraj? </span>
          <Link
            to="/register"
            className="font-semibold text-[#183F32] hover:underline"
          >
            Create an Account
          </Link>
        </div>

        <p className="text-[11px] text-[#77796F] text-center italic">
          *Demo Authentication: Click Sign In to test with pre-filled mock
          credentials.
        </p>
      </div>
    </div>
  );
};
