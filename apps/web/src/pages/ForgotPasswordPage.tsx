import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#F8F5ED] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-[#E5DFD3] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED] mx-auto shadow-xs">
            <Leaf className="w-6 h-6 text-[#A9B7A0]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#183F32]">
            Password Reset
          </h1>
          <p className="text-xs text-[#77796F]">
            Enter your email to receive simulated password recovery
            instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-lg bg-[#EFE9DB]/60 border border-[#A9B7A0] text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#285642] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#183F32]">
              Check Your Inbox
            </h3>
            <p className="text-xs text-[#77796F]">
              If an account matches <strong>{email}</strong>, a simulated reset
              link has been dispatched.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 text-xs font-semibold text-[#183F32] underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">
                Registered Email
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

            <button
              type="submit"
              className="w-full py-3.5 bg-[#183F32] text-[#F8F5ED] rounded-md text-sm font-semibold hover:bg-[#285642] transition-colors shadow-sm cursor-pointer"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#E5DFD3] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#77796F] hover:text-[#183F32] font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
