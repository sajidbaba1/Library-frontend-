import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, AlertCircle, CheckCircle, Loader2, DollarSign, Crown, Zap, BookOpen, Clock } from 'lucide-react';
import { User, ThemeColor, TIER_RULES, MembershipTier } from '../types';

interface WalletPanelProps {
  user: User;
  themeColor: ThemeColor;
  onAddFunds: (amount: number) => void;
  onPayFine: (amount: number) => void;
  onUpgradeTier?: (tier: MembershipTier) => void;
}

export const WalletPanel: React.FC<WalletPanelProps> = ({ user, themeColor, onAddFunds, onPayFine, onUpgradeTier }) => {
  const [addAmount, setAddAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [activeView, setActiveView] = useState<'wallet' | 'membership'>('wallet');

  const initiatePayment = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;
    setShowRazorpayModal(true);
    setPaymentStep('details');
  };

  const processPayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      onAddFunds(parseFloat(addAmount));
      setPaymentStep('success');
      setTimeout(() => {
        setShowRazorpayModal(false);
        setAddAmount('');
      }, 2000);
    }, 2000); // Simulate network delay
  };

  const handlePayFine = () => {
    if (user.walletBalance >= user.fines) {
      if(confirm(`Pay total fines of $${user.fines}?`)) {
        onPayFine(user.fines);
      }
    } else {
      alert("Insufficient wallet balance. Please add funds.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
        <button 
          onClick={() => setActiveView('wallet')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeView === 'wallet' ? `border-${themeColor}-500 text-${themeColor}-600` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Wallet & Fines
        </button>
        <button 
          onClick={() => setActiveView('membership')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeView === 'membership' ? `border-${themeColor}-500 text-${themeColor}-600` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Membership Plans
        </button>
      </div>

      {activeView === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className={`bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-700 rounded-2xl p-6 text-white shadow-xl`}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-${themeColor}-100 text-sm font-medium opacity-80">Total Balance</p>
                <h2 className="text-4xl font-bold mt-1">${user.walletBalance.toFixed(2)}</h2>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet size={24} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Amount to add"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button 
                  onClick={initiatePayment}
                  disabled={!addAmount}
                  className="px-4 py-2 bg-white text-${themeColor}-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <CreditCard size={16} /> Add Funds
                </button>
              </div>
              <p className="text-xs opacity-60 flex items-center gap-1">
                <CheckCircle size={12} /> Secured by Razorpay (Simulated)
              </p>
            </div>
          </div>

          {/* Fines Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <AlertCircle className="text-red-500" /> Outstanding Fines
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.fines > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {user.fines > 0 ? 'Payment Required' : 'All Clear'}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Fines are calculated automatically for books returned after their due date ($5.00/day).
              </p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                ${user.fines.toFixed(2)}
              </div>
            </div>
            
            <button 
              onClick={handlePayFine}
              disabled={user.fines <= 0}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                user.fines > 0 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              }`}
            >
              {user.fines > 0 ? 'Pay Fine Now' : 'No Fines Due'}
            </button>
          </div>
        </div>
      )}

      {activeView === 'membership' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(TIER_RULES) as [MembershipTier, typeof TIER_RULES['Standard']][]).map(([tier, rules]) => {
            const isCurrent = user.tier === tier;
            const isUpgrade = !isCurrent && rules.cost > TIER_RULES[user.tier].cost;
            
            return (
              <div key={tier} className={`relative rounded-2xl p-6 border transition-all ${isCurrent ? `border-${rules.color}-500 bg-${rules.color}-50 dark:bg-${rules.color}-900/20 shadow-lg ring-2 ring-${rules.color}-500/30` : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                {isCurrent && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-${rules.color}-500 text-white text-xs font-bold flex items-center gap-1`}>
                    <Crown size={12} fill="currentColor" /> CURRENT PLAN
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold text-${rules.color}-600 dark:text-${rules.color}-400 mb-2`}>{tier}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">${rules.cost}</span>
                    <span className="text-sm text-gray-500">/ one-time</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <BookOpen size={16} className={`text-${rules.color}-500`} />
                    <span>Max <strong>{rules.maxBooks} books</strong> at once</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Clock size={16} className={`text-${rules.color}-500`} />
                    <span><strong>{rules.loanDays} days</strong> loan duration</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                     <Zap size={16} className={`text-${rules.color}-500`} />
                     <span>{tier === 'Standard' ? 'Standard Access' : tier === 'Premium' ? 'Priority Support' : 'All Access Pass'}</span>
                  </div>
                </div>

                {onUpgradeTier && isUpgrade && (
                  <button 
                    onClick={() => onUpgradeTier(tier)}
                    className={`w-full py-2 rounded-lg font-bold transition-colors ${user.walletBalance >= rules.cost ? `bg-${rules.color}-600 text-white hover:bg-${rules.color}-700 shadow-lg shadow-${rules.color}-500/30` : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    disabled={user.walletBalance < rules.cost}
                  >
                    {user.walletBalance >= rules.cost ? 'Upgrade Now' : 'Insufficient Funds'}
                  </button>
                )}
                
                {!isUpgrade && !isCurrent && (
                  <button disabled className="w-full py-2 rounded-lg font-bold bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed">
                    Included
                  </button>
                )}
                 {isCurrent && (
                  <button disabled className={`w-full py-2 rounded-lg font-bold bg-${rules.color}-100 text-${rules.color}-700 dark:bg-${rules.color}-900/30 dark:text-${rules.color}-400 cursor-default`}>
                    Active
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Razorpay Simulation Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
          >
            {paymentStep === 'details' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-6" />
                  <button onClick={() => setShowRazorpayModal(false)} className="text-gray-400 hover:text-gray-600"><AlertCircle size={20} className="rotate-45" /></button>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Paying to</p>
                  <p className="font-bold text-lg">LibraMinds Wallet</p>
                  <p className="text-2xl font-bold mt-2">₹ {(parseFloat(addAmount) * 83).toFixed(2)} <span className="text-xs font-normal text-gray-400">($ {parseFloat(addAmount).toFixed(2)})</span></p>
                </div>
                <button 
                  onClick={processPayment}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Pay Now
                </button>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <h3 className="font-bold text-gray-800">Processing Payment...</h3>
                <p className="text-sm text-gray-500 mt-2">Please do not close this window.</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="p-10 flex flex-col items-center justify-center text-center bg-green-50">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-bold text-green-800 text-xl">Payment Successful!</h3>
                <p className="text-sm text-green-600 mt-2">Funds have been added to your wallet.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};