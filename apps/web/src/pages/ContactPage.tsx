import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Leaf,
} from "lucide-react";

export const ContactPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5ED] py-14">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B49A63]">
            Direct Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#183F32] font-bold">
            Connect with Tulsi Swaraj
          </h1>
          <p className="text-sm text-[#77796F]">
            We welcome your questions regarding our herbal preparation, dispatch
            schedules, and bulk inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-5xl mx-auto">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-[#EFE9DB]/70 rounded-xl p-8 border border-[#E5DFD3] space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED]">
                <Leaf className="w-4 h-4 text-[#A9B7A0]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#183F32]">
                Our Care Office
              </h2>
            </div>

            <div className="space-y-4 text-xs text-[#252923]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">
                    Bengaluru Studio
                  </strong>
                  <p className="text-[#77796F] mt-0.5">
                    100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038,
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">
                    Email Correspondence
                  </strong>
                  <p className="text-[#77796F] mt-0.5">
                    support@tulsiswaraj.example.in
                  </p>
                  <p className="text-[#77796F]">care@tulsiswaraj.example.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">
                    Direct Phone Helpline
                  </strong>
                  <p className="text-[#77796F] mt-0.5">+91 (080) 4920-8000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#183F32]">
                    Operating Hours
                  </strong>
                  <p className="text-[#77796F] mt-0.5">
                    Monday to Saturday: 9:00 AM – 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-md bg-white border border-[#A9B7A0] text-xs text-[#77796F]">
              <p>
                *For order tracking or refunds, authenticated customers can also
                open tickets instantly via their dashboard.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-xl p-8 border border-[#E5DFD3] shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#285642] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-[#183F32]">
                  Message Dispatched
                </h3>
                <p className="text-xs text-[#77796F] max-w-sm mx-auto">
                  Thank you for writing to us. Our customer care team in
                  Bengaluru will get back to you within 24–48 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-[#183F32] underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-[#183F32] mb-2">
                  Send Us an Inquiry
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#183F32]">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Meera Nair"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#183F32]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="meera@example.in"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#183F32]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 Mobile number"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#183F32]">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Bulk order inquiry"
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183F32]">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] text-xs focus:ring-1 focus:ring-[#183F32]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-md text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
