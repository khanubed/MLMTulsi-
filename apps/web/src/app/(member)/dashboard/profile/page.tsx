'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Save } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const ProfileSchema = z.object({
  fullName: z.string().min(2, 'Name is required (min 2 characters)'),
  email: z.string().email('Valid email is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number is required'),
  houseFlat: z.string().min(3, 'Flat / House details are required'),
  streetLocality: z.string().min(3, 'Street, colony or locality is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'Valid 6-digit Indian PIN code is required'),
});

type ProfileFormData = z.infer<typeof ProfileSchema>;

export default function DashboardProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { user, updateProfile } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      houseFlat: '',
      streetLocality: '',
      landmark: '',
      city: '',
      state: '',
      pinCode: '',
    },
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        houseFlat: user.defaultAddress?.houseFlat || '',
        streetLocality: user.defaultAddress?.streetLocality || '',
        landmark: user.defaultAddress?.landmark || '',
        city: user.defaultAddress?.city || '',
        state: user.defaultAddress?.state || '',
        pinCode: user.defaultAddress?.pinCode || '',
      });
    }
  }, [user, reset]);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-[#EFE9DB] rounded" />
        <div className="h-64 bg-[#EFE9DB] rounded-2xl" />
      </div>
    );
  }

  const onSubmit = (data: ProfileFormData) => {
    updateProfile({
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      defaultAddress: {
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        houseFlat: data.houseFlat,
        streetLocality: data.streetLocality,
        landmark: data.landmark || '',
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        country: 'India',
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
        <div className="p-4 rounded-xl bg-[#EFE9DB] border border-[#285642] text-xs text-[#285642] flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#285642]" />
          <span>Profile and primary shipping address updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-[#183F32]">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">Full Name *</label>
              <input
                type="text"
                {...register('fullName')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">Email Address *</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.email ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">Mobile Number *</label>
              <input
                type="tel"
                {...register('mobile')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.mobile ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.mobile && (
                <p className="text-xs text-red-600">{errors.mobile.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Default Delivery Address */}
        <div className="space-y-4 pt-4 border-t border-[#E5DFD3]">
          <h3 className="font-serif text-base font-bold text-[#183F32]">
            Default Delivery Address (India)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">
                Flat, House No., Building Name *
              </label>
              <input
                type="text"
                {...register('houseFlat')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.houseFlat ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.houseFlat && (
                <p className="text-xs text-red-600">{errors.houseFlat.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">
                Street, Colony, Sector, Locality *
              </label>
              <input
                type="text"
                {...register('streetLocality')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.streetLocality ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.streetLocality && (
                <p className="text-xs text-red-600">{errors.streetLocality.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">Landmark (Optional)</label>
              <input
                type="text"
                {...register('landmark')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                {...register('pinCode')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.pinCode ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.pinCode && (
                <p className="text-xs text-red-600">{errors.pinCode.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">City *</label>
              <input
                type="text"
                {...register('city')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.city ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.city && (
                <p className="text-xs text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#183F32]">State *</label>
              <input
                type="text"
                {...register('state')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
                  errors.state ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
                }`}
              />
              {errors.state && (
                <p className="text-xs text-red-600">{errors.state.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-xl text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
}
