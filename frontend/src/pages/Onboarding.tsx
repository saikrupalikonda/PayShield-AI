import React, { useState } from 'react';
import { UserCheck, Shield, ArrowRight, Loader2, Info } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || 'Demo User');
  const [ageGroup, setAgeGroup] = useState(user?.age_group || '26–40');
  const [profession, setProfession] = useState(user?.profession || 'Employee');
  const [experience, setExperience] = useState(user?.digital_banking_exp || 'Frequent');
  const [bankingDuration, setBankingDuration] = useState('3–5 years');
  const [preferredMethod, setPreferredMethod] = useState(user?.preferred_payment_method || 'UPI');
  const [typicalRange, setTypicalRange] = useState('₹1,000–₹5,000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.completeOnboarding({
        full_name: fullName,
        age_group: ageGroup,
        profession: profession,
        digital_banking_exp: experience,
        preferred_payment_method: preferredMethod,
        typical_txn_range: typicalRange
      });
      updateUser(updated);
      onComplete();
    } catch (err) {
      console.error('Onboarding failed:', err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white dark:bg-navy-850 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-brand-700 dark:text-blue-300 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Personalize Your Safety Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            This information is used strictly to customize educational warnings and contextual friction levels.
          </p>
        </div>

        {/* Safety Note */}
        <div className="mb-6 p-3.5 bg-blue-50/80 dark:bg-navy-800/80 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-brand-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            PayShield never asks for or stores UPI PINs, bank passwords, CVVs, or account numbers. We only collect behavioral context to calibrate warning sensitivity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Age Group */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Under 18">Under 18</option>
                <option value="18–25">18–25</option>
                <option value="26–40">26–40</option>
                <option value="41–60">41–60</option>
                <option value="60+">60+</option>
              </select>
            </div>

            {/* Profession */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Profession
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Student">Student</option>
                <option value="Employee">Employee</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Payment Experience */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Digital Payment Frequency
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Beginner">Beginner (Rarely pay online)</option>
                <option value="Moderate">Moderate (Few times a month)</option>
                <option value="Frequent">Frequent (Daily payments)</option>
              </select>
            </div>

            {/* How long using digital banking */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                How long have you used digital banking?
              </label>
              <select
                value={bankingDuration}
                onChange={(e) => setBankingDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1–3 years">1–3 years</option>
                <option value="3–5 years">3–5 years</option>
                <option value="More than 5 years">More than 5 years</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Preferred Payment Method */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Payment Method
              </label>
              <select
                value={preferredMethod}
                onChange={(e) => setPreferredMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Digital Wallet</option>
              </select>
            </div>

            {/* Typical range */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Typical Transaction Range
              </label>
              <select
                value={typicalRange}
                onChange={(e) => setTypicalRange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Under ₹1,000">Under ₹1,000</option>
                <option value="₹1,000–₹5,000">₹1,000–₹5,000</option>
                <option value="₹5,000–₹25,000">₹5,000–₹25,000</option>
                <option value="Over ₹25,000">Over ₹25,000</option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Save Profile & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
