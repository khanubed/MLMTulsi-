import React, { useState } from "react";
import { CheckCircle2, Send, Mail, Phone, Clock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const DashboardSupportPage: React.FC = () => {
  const { user, orders } = useAuthStore();

  const [selectedOrderId, setSelectedOrderId] = useState(
    orders[0]?.id || "General Inquiry",
  );
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
    <div className="space-y-6">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#183F32]">
          Customer Support Desk
        </h2>
        <p className="text-xs text-[#77796F] mt-0.5">
          Submit queries regarding orders, packaging, formulation, or
          deliveries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Form */}
        <div className="lg:col-span-7 bg-[#F8F5ED] rounded-lg p-6 border border-[#E5DFD3]">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#285642] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#183F32]">
                Support Ticket Generated (#TKT-
                {Math.floor(10000 + Math.random() * 90000)})
              </h3>
              <p className="text-xs text-[#77796F] max-w-sm mx-auto">
                Thank you, {user?.fullName}. Our Bengaluru team will review your
                inquiry and respond within 24 business hours to {user?.email}.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage("");
                  setSubject("");
                }}
                className="mt-2 text-xs font-semibold text-[#183F32] underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183F32]">
                  Related Order
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] bg-white text-xs"
                >
                  <option value="General Inquiry">
                    General Product Inquiry
                  </option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.id} ({o.date} - ₹{o.total})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183F32]">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Expected dispatch date for my order"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] bg-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183F32]">
                  Message Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our wellness care team assist you today?"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#A9B7A0] bg-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-md text-xs font-semibold hover:bg-[#285642] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-lg bg-white border border-[#E5DFD3] space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#183F32]">
              Direct Channels
            </h3>

            <div className="space-y-3 text-xs text-[#77796F]">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#252923] block">
                    Email Support
                  </span>
                  <span>support@tulsiswaraj.example.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#252923] block">
                    Care Helpline
                  </span>
                  <span>+91 (080) 4920-8000</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#285642] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#252923] block">
                    Support Hours
                  </span>
                  <span>Monday to Saturday: 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-md bg-[#EFE9DB]/60 border border-[#A9B7A0] text-xs text-[#77796F]">
            <p>
              *Please allow up to 24 business hours for order-related updates
              during festive peaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
