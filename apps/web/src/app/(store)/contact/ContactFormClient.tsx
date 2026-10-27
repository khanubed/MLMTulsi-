'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle2 } from 'lucide-react';

const ContactFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')
    .or(z.literal(''))
    .optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

export const ContactFormClient: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate inquiry dispatch
    await new Promise((res) => setTimeout(res, 500));
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-[#285642] mx-auto" />
        <h3 className="font-serif text-xl font-bold text-[#183F32]">Message Dispatched</h3>
        <p className="text-xs text-[#77796F] max-w-sm mx-auto">
          Thank you for writing to us. Our customer care team in Bengaluru will get back to you
          within 24–48 business hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs font-semibold text-[#183F32] underline cursor-pointer"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="font-serif text-xl font-bold text-[#183F32] mb-2">Send Us an Inquiry</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#183F32]">Your Name *</label>
          <input
            type="text"
            placeholder="e.g. Meera Nair"
            {...register('fullName')}
            className={`w-full px-3.5 py-2.5 rounded-md border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
              errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
            }`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#183F32]">Email Address *</label>
          <input
            type="email"
            placeholder="meera@example.in"
            {...register('email')}
            className={`w-full px-3.5 py-2.5 rounded-md border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
              errors.email ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#183F32]">Phone Number</label>
          <input
            type="tel"
            placeholder="+91 Mobile number"
            {...register('phone')}
            className={`w-full px-3.5 py-2.5 rounded-md border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
              errors.phone ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
            }`}
          />
          {errors.phone && (
            <p className="text-[11px] text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#183F32]">Subject *</label>
          <input
            type="text"
            placeholder="e.g. Bulk order inquiry"
            {...register('subject')}
            className={`w-full px-3.5 py-2.5 rounded-md border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
              errors.subject ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
            }`}
          />
          {errors.subject && (
            <p className="text-[11px] text-red-600">{errors.subject.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-[#183F32]">Message *</label>
        <textarea
          rows={4}
          placeholder="Tell us how we can help..."
          {...register('message')}
          className={`w-full px-3.5 py-2.5 rounded-md border text-xs focus:ring-1 focus:ring-[#183F32] focus:outline-none ${
            errors.message ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0]'
          }`}
        />
        {errors.message && (
          <p className="text-[11px] text-red-600">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-md text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
      </button>
    </form>
  );
};
