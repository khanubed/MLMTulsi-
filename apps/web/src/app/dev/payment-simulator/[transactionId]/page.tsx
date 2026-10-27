'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface TransactionData {
  merchantTransactionId: string;
  providerReference: string;
  amountRupees: number;
  currency: string;
  status: string;
  mockStatus: string;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    status: string;
    purpose: string;
  };
}

export default function PaymentSimulatorPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = use(params);
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/dev/payment-simulator/${transactionId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to fetch transaction details');
      }
      setData(json.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [transactionId]);

  const handleAction = async (action: 'success' | 'failure' | 'pending') => {
    try {
      setActionLoading(true);
      setMessage(null);
      setError(null);

      const res = await fetch(`/api/v1/dev/payment-simulator/${transactionId}/${action}`, {
        method: 'POST',
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || `Failed to trigger ${action}`);
      }

      setMessage(json.message || `Payment marked as ${action.toUpperCase()}`);
      await fetchStatus();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-[#183F32]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#183F32] border-t-transparent mb-4"></div>
          <p className="font-medium">Loading Payment Simulator...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-[#183F32]">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Simulator Error</h1>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#183F32] text-white rounded-xl text-sm font-semibold hover:bg-[#122e25]"
          >
            Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Banner */}
        <div className="bg-[#183F32] text-white p-6 rounded-2xl shadow-lg mb-6 text-center">
          <span className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 bg-amber-400 text-stone-900 rounded-full mb-3">
            Local Testing Environment
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Payment Simulator</h1>
          <p className="text-emerald-100 text-xs mt-1">
            Simulate realistic PhonePe outcomes without credentials or real money
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              ⚠ {error}
            </div>
          )}

          {/* Details */}
          <div className="divide-y divide-stone-100 text-sm">
            <div className="py-3 flex justify-between items-center">
              <span className="text-stone-500 font-medium">Current Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  data?.status === 'SUCCESS' || data?.mockStatus === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : data?.status === 'FAILED' || data?.mockStatus === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {data?.status || 'PENDING'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-stone-500 font-medium">Amount Due</span>
              <span className="text-lg font-bold text-[#183F32]">
                ₹{data?.amountRupees.toFixed(2)} {data?.currency}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-stone-500 font-medium">Order Number</span>
              <span className="font-mono font-medium text-stone-800">
                {data?.order.orderNumber}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-stone-500 font-medium">Customer</span>
              <span className="text-stone-800 font-medium">
                {data?.order.customerName} ({data?.order.customerPhone})
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-stone-500 font-medium">Transaction Ref</span>
              <span className="font-mono text-xs text-stone-500 truncate max-w-[200px]">
                {data?.merchantTransactionId}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <p className="text-xs uppercase font-bold text-stone-400 tracking-wider">
              Trigger Simulation Actions
            </p>

            <button
              onClick={() => handleAction('success')}
              disabled={actionLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>✓ Simulate Payment SUCCESS</span>
            </button>

            <button
              onClick={() => handleAction('failure')}
              disabled={actionLoading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>✕ Simulate Payment FAILURE</span>
            </button>

            <button
              onClick={() => handleAction('pending')}
              disabled={actionLoading}
              className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition duration-150 cursor-pointer disabled:opacity-50"
            >
              <span>⏱ Reset to PENDING</span>
            </button>
          </div>

          {/* Order link */}
          {data?.order.id && (
            <div className="pt-2 text-center">
              <Link
                href={`/order-confirmation/${data.order.id}`}
                className="text-xs font-semibold text-[#183F32] hover:underline"
              >
                Go to Order Confirmation Page →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
