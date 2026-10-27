import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, Leaf } from 'lucide-react';
import { ContactFormClient } from './ContactFormClient';

export const metadata: Metadata = {
  title: 'Connect with Us',
  description:
    'Contact the Tulsi Swaraj botanical team in Bengaluru for questions, orders, and inquiries.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <article className="min-h-screen bg-[#F8F5ED] py-14">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B49A63]">
            Direct Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183F32] font-bold">
            Connect with Tulsi Swaraj
          </h1>
          <p className="text-sm text-[#77796F]">
            We welcome your questions regarding our herbal preparation, dispatch schedules, and
            bulk inquiries.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-5xl mx-auto">
          {/* Contact Details Card */}
          <aside className="lg:col-span-5 bg-[#EFE9DB]/70 rounded-2xl p-6 sm:p-8 border border-[#E5DFD3] space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED]">
                <Leaf className="w-4 h-4 text-[#A9B7A0]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#183F32]">Our Care Office</h2>
            </div>

            <div className="space-y-4 text-xs text-[#252923]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">Bengaluru Studio</strong>
                  <p className="text-[#77796F] mt-0.5">
                    100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">Email Correspondence</strong>
                  <p className="text-[#77796F] mt-0.5">support@tulsiswaraj.example.in</p>
                  <p className="text-[#77796F]">care@tulsiswaraj.example.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">Direct Phone Helpline</strong>
                  <p className="text-[#77796F] mt-0.5">+91 (080) 4920-8000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">Operating Hours</strong>
                  <p className="text-[#77796F] mt-0.5">Monday to Saturday: 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#A9B7A0] text-xs text-[#77796F]">
              <p>
                *For order tracking or refunds, authenticated customers can also open tickets
                instantly via their dashboard.
              </p>
            </div>
          </aside>

          {/* Contact Form Island */}
          <section className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs">
            <ContactFormClient />
          </section>
        </div>
      </div>
    </article>
  );
}
