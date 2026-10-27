'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, ArrowRight, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const RegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
    email: z.string().email('Please enter a valid email address'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service to create an account' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      agreeTerms: true,
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerAuth(data.fullName, data.email, data.mobile);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[85vh] bg-[#F8F5ED] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5DFD3] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED] mx-auto shadow-2xs">
            <Leaf className="w-6 h-6 text-[#A9B7A0]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#183F32]">
            Create Member Account
          </h1>
          <p className="text-xs text-[#77796F]">
            Join Tulsi Swaraj to receive order dispatches, access account history, and explore
            authentic Ayurvedic preparations.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Meera Nair"
                {...register('fullName')}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                  errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              <User className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                placeholder="meera@example.in"
                {...register('email')}
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
            <label className="text-xs font-semibold text-[#183F32]">Mobile Number *</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="10-digit Indian number"
                {...register('mobile')}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                  errors.mobile ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              <Phone className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
            {errors.mobile && (
              <p className="text-xs text-red-600">{errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">Create Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#183F32]">Confirm Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-type your password"
                {...register('confirmPassword')}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              <Lock className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-[#252923] cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="mt-0.5 rounded text-[#183F32] focus:ring-[#183F32]"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="underline font-semibold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" target="_blank" className="underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-red-600 mt-1">{errors.agreeTerms.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#183F32] text-[#F8F5ED] rounded-xl text-sm font-semibold hover:bg-[#285642] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>Register Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5DFD3] text-center text-xs text-[#77796F]">
          <span>Already registered? </span>
          <Link href="/login" className="font-semibold text-[#183F32] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
