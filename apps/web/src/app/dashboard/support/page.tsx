'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Send, Mail, Phone, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const SupportTicketSchema = z.object({
  orderId: z.string().min(1, 'Please select or enter related order'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type SupportTicketFormData = z.infer<typeof SupportTicketSchema>;

export default function DashboardSupportPage() {
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const { user, orders } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportTicketFormData>({
    resolver: zodResolver(SupportTicketSchema),
    defaultValues: {
      orderId: 'General Inquiry',
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-[#EFE9DB] rounded" />
        <div className="h-64 bg-[#EFE9DB] rounded-2xl" />
      </div>
    );
  }

  const onSubmit = async (data: SupportTicketFormData) => {
    await new Promise((res) => setTimeout(res, 400));
    setTicketId(`TKT-${Math.floor(10000 + Math.random() * 90000)}`);
    setSubmitted(true);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#183F32]">Customer Support Desk</h2>
        <p className="text-xs text-[#77796F] mt-0.5">
          Submit queries regarding orders, packaging, formulation, or deliveries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Form */}
        <div className="lg:col-span-7 bg-[#F8F5ED] rounded-2xl p-6 border border-[#E5DFD3]">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#285642] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#183F32]">
                Support Ticket Generated (#{ticketId})
              </h3>
              <p className="text-xs text-[#77796F] max-w-sm mx-auto">
                Thank you, {user?.fullName}. Our Bengaluru team will review your inquiry and respond
                within 24 business hours to {user?.email}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold text-[#183F32] underline cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183F32]">Related Order</label>
                <select
                  {...register('orderId')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#A9B7A0] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#183F32]"
                >
                  <option value="General Inquiry">General Product Inquiry</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.id} ({o.date} - ₹{o.total})
                    </option>
                  ))}
                </select>
                {errors.orderId && (
                  <p className="text-xs text-red-600">{errors.orderId.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183F32]">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Expected dispatch date for my order"
                  {...register('subject')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                    errors.subject ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0] bg-white'
                  }`}
                />
                {errors.subject && (
                  <p className="text-xs text-red-600">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183F32]">Message Details</label>
                <textarea
                  rows={4}
                  placeholder="How can our wellness care team assist you today?"
                  {...register('message')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#183F32] ${
                    errors.message ? 'border-red-500 bg-red-50/50' : 'border-[#A9B7A0] bg-white'
                  }`}
                />
                {errors.message && (
                  <p className="text-xs text-red-600">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-xl text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E5DFD3] space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#183F32]">Direct Channels</h3>

            <div className="space-y-3 text-xs text-[#77796F]">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#252923] block">Email Support</span>
                  <span>support@tulsiswaraj.example.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#252923] block">Care Helpline</span>
                  <span>+91 (080) 4920-8000</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#252923] block">Support Hours</span>
                  <span>Monday to Saturday: 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EFE9DB]/60 border border-[#A9B7A0] text-xs text-[#77796F]">
            <p>
              *Please allow up to 24 business hours for order-related updates during festive peaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
