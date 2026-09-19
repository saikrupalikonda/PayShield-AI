import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { RiskAnalysisResult } from '../../types';

interface DemoScenarioBarProps {
  onScenarioLoaded: (result: RiskAnalysisResult) => void;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({ onScenarioLoaded }) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);

  const runScenario = async (
    scenarioId: 'safe' | 'refund' | 'support'
  ) => {
    setLoadingScenario(scenarioId);
    try {
      let params;
      if (scenarioId === 'safe') {
        params = {
          identifier: 'verifiedmerchant@demo',
          identifier_type: 'upi',
          amount: 500,
          recipient_name: 'Metro Retail Mart Ltd',
          is_new_recipient: false,
          payment_channel: 'Merchant',
          demo_scenario: 'Scenario 1 – Safe Verified Merchant'
        };
      } else if (scenarioId === 'refund') {
        params = {
          identifier: 'quick.refund99@paytm',
          identifier_type: 'upi',
          amount: 5000,
          recipient_name: 'Quick Refund Desk',
          message: 'You were accidentally sent ₹5,000. Return it immediately to this different UPI ID.',
          is_new_recipient: true,
          payment_channel: 'SMS',
          claims_emergency: false,
          immediate_action_demanded: true,
          demo_scenario: 'Scenario 2 – Accidental Deposit Refund Scam'
        };
      } else {
        params = {
          identifier: 'sbi.kyc.update@sbi',
          identifier_type: 'upi',
          amount: 9999,
          recipient_name: 'SBI Netbanking KYC Unit',
          message: 'Your account will be blocked today. Contact our support agent and complete verification immediately.',
          is_new_recipient: true,
          payment_channel: 'SMS',
          claims_emergency: true,
          immediate_action_demanded: true,
          demo_scenario: 'Scenario 3 – Fake Bank Customer Support & Block Threat'
        };
      }

      const result = await api.analyzeRisk(params);
      onScenarioLoaded(result);
    } catch (err) {
      console.error('Failed to run demo scenario:', err);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/90 via-navy-850 to-indigo-950 text-white rounded-2xl p-4 shadow-lg border border-blue-500/30 my-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                Judge Demo Mode
              </span>
              <span className="text-xs text-blue-300/80">One-click test scenarios</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Instantly test how PayShield detects and explains different scam topologies.
            </p>
          </div>
        </div>

        {/* Right: 3 Scenario Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          
          {/* Scenario 1: SAFE */}
          <button
            onClick={() => runScenario('safe')}
            disabled={loadingScenario !== null}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loadingScenario === 'safe' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="truncate">1. Safe Merchant (₹500)</span>
          </button>

          {/* Scenario 2: REFUND SCAM (Primary Demo Scenario) */}
          <button
            onClick={() => runScenario('refund')}
            disabled={loadingScenario !== null}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-sm"
          >
            {loadingScenario === 'refund' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="truncate">2. Refund Scam (₹5,000)</span>
          </button>

          {/* Scenario 3: FAKE SUPPORT */}
          <button
            onClick={() => runScenario('support')}
            disabled={loadingScenario !== null}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-sm"
          >
            {loadingScenario === 'support' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="truncate">3. Fake Bank KYC Threat</span>
          </button>

        </div>

      </div>
    </div>
  );
};
