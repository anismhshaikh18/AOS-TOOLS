import React from 'react';
import { Info, Target, Heart, CheckCircle2, ShieldCheck, Laptop } from 'lucide-react';

interface AboutViewProps {
  onExploreTools: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onExploreTools }) => {
  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Banner / Heading */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#052f52] via-[#073963] to-[#0a4677] border border-[#0e4f85]/50 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <Info className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                About Us
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Simple Tools. Real Value. Always Free.
            </p>
          </div>

          {/* Laptop Preview Graphic (matching screenshot) */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-48 sm:w-56 h-32 bg-[#021526] border-2 border-slate-700 rounded-xl p-2.5 shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="w-full flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <span className="text-[8px] font-mono text-slate-400">aostools.local</span>
              </div>
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-white ring-2 ring-[#0d4775] flex items-center justify-center shadow-md mb-1 p-0.5">
                  <img
                    src="/assets/aistudio/AOS_Logo_783714c3.png"
                    alt="AOS Logo"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <span className="text-[11px] font-bold text-white tracking-tight">AOS TOOLS</span>
                <span className="text-[8px] text-red-400 font-semibold">100% Free Tools</span>
              </div>
              <div className="w-full h-1 bg-red-500/30 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-6">
        {/* Card 1: Our Mission */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#072642] dark:bg-[#072642] border border-[#0d4775] shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Our Mission
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-12">
            AOS TOOLS is created to make everyday digital tasks simple, fast and accessible to everyone. We provide useful online tools like passport photo printing, PDF tools, image tools, citizen Khata ledgers, and PAN services — all in one place, completely free.
          </p>
        </div>

        {/* Card 2: Why Choose Us? */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#072642] dark:bg-[#072642] border border-[#0d4775] shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Why Choose Us?
            </h2>
          </div>
          <ul className="space-y-3 pl-12 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div>
                <strong className="text-white">100% Free</strong> – No hidden charges, no subscription.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div>
                <strong className="text-white">Fast & Easy to Use</strong> – Simple interface, no technical skills needed.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div>
                <strong className="text-white">Secure & Private</strong> – Your data stays on your device.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div>
                <strong className="text-white">Works on All Devices</strong> – Mobile, tablet and desktop friendly.
              </div>
            </li>
          </ul>
        </div>

        {/* Card 3: Our Promise */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#072642] dark:bg-[#072642] border border-[#0d4775] shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Our Promise
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-12">
            We will always keep AOS TOOLS free for everyone. No paid features, no hidden costs, no unnecessary redirects. Just helpful tools, made with care.
          </p>
          <div className="pt-4 pl-12">
            <div className="inline-block relative">
              <p className="text-xl sm:text-2xl font-serif italic text-red-400 font-bold tracking-wide">
                Thank you for being here!
              </p>
              <svg className="w-full h-3 text-red-500 mt-1" viewBox="0 0 200 12" fill="none">
                <path d="M2 9C50 3 150 2 198 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
