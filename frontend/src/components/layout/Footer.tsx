import React from 'react';
import { ShieldCheck, PhoneCall, ExternalLink, AlertOctagon } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">PayShield</span>
            </div>
            <p className="text-slate-300 font-medium italic">
              "Pause. Verify. Pay Safely."
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              An AI-assisted safety platform detecting social engineering and authorised push payment scam patterns before simulated UPI transactions are confirmed.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate?.('dashboard')} className="hover:text-blue-400 transition-colors">
                  Home Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('detect')} className="hover:text-blue-400 transition-colors">
                  Risk Detection Workbench
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('history')} className="hover:text-blue-400 transition-colors">
                  Detection History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('awareness')} className="hover:text-blue-400 transition-colors">
                  Scam Awareness Guides
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('admin')} className="hover:text-blue-400 transition-colors">
                  Model Benchmark Evaluation
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Safety & Cybercrime */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Cyber Assistance
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>National Helpline: </span>
                <span className="font-bold text-white">1930</span>
              </li>
              <li>
                <a 
                  href="https://cybercrime.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate?.('awareness')} className="hover:text-blue-400 transition-colors">
                  Pre-reporting Checklist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('awareness')} className="hover:text-blue-400 transition-colors">
                  Cooling-off Principles
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety Rule */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
            <h4 className="text-white font-semibold text-xs flex items-center gap-1.5 mb-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Golden Rule of UPI
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
              Entering your UPI PIN or scanning a receiver QR code <strong>ALWAYS sends money out</strong> of your account. You NEVER enter a PIN to receive funds.
            </p>
            <p className="text-[10px] text-slate-400">
              Never disclose OTPs, PINs, or install remote access software.
            </p>
          </div>
        </div>

        {/* Disclaimer Banner (Section 46) */}
        <div className="pt-6 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 max-w-4xl mx-auto leading-relaxed">
            <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px] mr-1.5">
              Important Prototype Boundary:
            </span>
            PayShield is a demonstration prototype designed to identify scam-pattern risk signals using synthetic data. It does not access bank accounts, initiate real transactions, or provide definitive fraud determinations.
          </div>
          <p className="mt-4 text-[11px] text-slate-500">
            © {new Date().getFullYear()} PayShield AI. Designed for Fintech & Cybersecurity Safety Demonstration.
          </p>
        </div>

      </div>
    </footer>
  );
};
