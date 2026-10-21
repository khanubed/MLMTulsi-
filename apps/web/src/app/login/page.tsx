'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, Leaf, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'aarav.sharma@example.in',
      password: 'password123',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data.email, 'Aarav Sharma');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] bg-[#F8F5ED] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5DFD3] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED] mx-auto shadow-2xs">
            <Leaf className="w-6 h-6 text-[#A9B7A0]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#183F32]">
            Welcome to Tulsi Swaraj
          </h1>
          <p className="text-xs text-[#77796F]">
            Sign in to track orders, access your wellness preferences, and manage account details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                {...register('email')}
                placeholder="name@example.in"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                  errors.email ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              <Mail className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#183F32]">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-[#285642] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                  errors.password ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              <Lock className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#77796F] hover:text-[#183F32] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#183F32] text-[#F8F5ED] rounded-xl text-sm font-semibold hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5DFD3] text-center text-xs text-[#77796F]">
          <span>New to Tulsi Swaraj? </span>
          <Link href="/register" className="font-semibold text-[#183F32] hover:underline">
            Create an Account
          </Link>
        </div>

        <p className="text-[11px] text-[#77796F] text-center italic">
          *Demo Authentication: Click Sign In to test with pre-filled mock credentials.
        </p>
      </div>
    </div>
  );
}
