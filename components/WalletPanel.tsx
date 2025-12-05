import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, AlertCircle, CheckCircle, Loader2, DollarSign } from 'lucide-react';
import { User, ThemeColor } from '../types';

interface WalletPanelProps {
  user: User;
  themeColor: ThemeColor;
  onAddFunds: (amount: number) => void;
  onPayFine: (amount: number) => void;
}

export const WalletPanel: React.FC<WalletPanelProps> = ({ user, themeColor, onAddFunds, onPayFine }) => {
  const [addAmount, setAddAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');

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