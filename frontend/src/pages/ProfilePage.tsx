import React, { useState, useEffect } from 'react';
import { User, Shield, Phone, CheckCircle, Award, Edit2, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || 'Demo User');
  const [ageGroup, setAgeGroup] = useState(user?.age_group || '26–40');
  const [profession, setProfession] = useState(user?.profession || 'Employee');
  const [experience, setExperience] = useState(user?.digital_banking_exp || 'Frequent');
  const [preferredMethod, setPreferredMethod] = useState(user?.preferred_payment_method || 'UPI');
  const [typicalRange, setTypicalRange] = useState(user?.typical_txn_range || '₹1,000–₹5,000');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getHistoryStats().then(setStats).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        age_group: ageGroup,
        profession: profession,
        digital_banking_exp: experience,
        preferred_payment_method: preferredMethod,
        typical_txn_range: typicalRange
      });
      updateUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          User Safety Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your calibrated payment safety persona and PayShield intervention activity.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-navy-850 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 to-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.full_name || 'PayShield User'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                  {user?.masked_mobile || '+91 98*** ***10'}
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">
                  Verified Demo OTP
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Profile Info Form / Display */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Under 18">Under 18</option>
                  <option value="18–25">18–25</option>
                  <option value="26–40">26–40</option>
                  <option value="41–60">41–60</option>
                  <option value="60+">60+</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Profession
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Digital Payment Frequency
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Frequent">Frequent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Payment Method
                </label>
                <select
                  value={preferredMethod}
                  onChange={(e) => setPreferredMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Wallet">Digital Wallet</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Typical Transaction Range
                </label>
                <select
                  value={typicalRange}
                  onChange={(e) => setTypicalRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
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
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Age Group</span>
              <span className="font-semibold text-slate-800 dark:text-white text-sm">{user?.age_group || '26–40'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Profession</span>
              <span className="font-semibold text-slate-800 dark:text-white text-sm">{user?.profession || 'Employee'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Payment Frequency</span>
              <span className="font-semibold text-slate-800 dark:text-white text-sm">{user?.digital_banking_exp || 'Frequent'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Preferred Method</span>
              <span className="font-semibold text-slate-800 dark:text-white text-sm">{user?.preferred_payment_method || 'UPI'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Typical Range</span>
              <span className="font-semibold text-slate-800 dark:text-white text-sm">{user?.typical_txn_range || '₹1,000–₹5,000'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Account Protection</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">Active AI Interlock</span>
            </div>
          </div>
        )}

      </div>

      {/* Safety Milestones & Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Safety Inquiries</span>
            <Shield className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white block">
            {stats?.total_analyzed ?? 14}
          </span>
          <p className="text-[11px] text-slate-500">Total recipient identifiers inspected before payment.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fraud Interventions</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
            {stats?.cancelled_count ?? 4}
          </span>
          <p className="text-[11px] text-slate-500">Payments safely cancelled following high-risk warnings.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Safety Playbooks Read</span>
            <CheckCircle className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 block">
            5 / 5
          </span>
          <p className="text-[11px] text-slate-500">Full Authorised Push Payment awareness curriculum completed.</p>
        </div>
      </div>

    </div>
  );
};
