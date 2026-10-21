import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#F8F5ED]">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#183F32] flex items-center justify-center text-[#F8F5ED] shadow-sm">
          <Leaf className="w-8 h-8 text-[#A9B7A0]" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B49A63]">
            Page Not Found • 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#183F32]">
            Lost in the Sanctuary
          </h1>
          <p className="text-sm text-[#77796F] leading-relaxed">
            The page you are looking for does not exist or may have been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#183F32] text-[#F8F5ED] rounded-xl text-sm font-semibold hover:bg-[#285642] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
