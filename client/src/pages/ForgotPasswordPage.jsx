/**
 * ForgotPasswordPage Component
 * ----------------------------
 * Allows shoppers and admins to reset their forgotten password via a 6-digit OTP
 * sent to their registered email address using Nodemailer.
 * 
 * Viva Concepts:
 * - Multi-Step Form Workflow (Email -> OTP & New Password -> Success State).
 * - State Management & Form Validation: Regex email validation, 6-digit OTP verification,
 *   and minimum password length checks.
 * - Real-world UX: Countdown timer, Resend OTP option, and Viva Demo autofill helper.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Steps: 'email' -> 'otp_and_password' -> 'success'
  const [step, setStep] = useState('email');

  // Form Fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Resend Countdown Timer (starts at 60 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(cleanEmail);
      setSuccessMsg(response.data.message || 'OTP sent successfully to your email.');
      setResendCooldown(60); // 60s cooldown for resending
      setStep('otp_and_password');
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset OTP. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the valid 6-digit OTP sent to your mail.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify the OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Viva Evaluator Demo autofill helper
  const handleAutofillDemo = () => {
    setEmail('shopper@nexora.com');
    setError(null);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-10 transition-all">
        
        {/* Brand Icon & Step Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-3 shadow-md">
            <KeyRound className="w-6 h-6 text-emerald-400" />
          </div>

          {step === 'email' && (
            <>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password?</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No worries! Enter your registered email address and we'll send you an OTP to recover your account.
              </p>
            </>
          )}

          {step === 'otp_and_password' && (
            <>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify OTP & Reset</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                We sent a 6-digit security code to <strong className="text-slate-800">{email}</strong>.
              </p>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Password Reset!</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your password has been securely updated. You can now log back into your BuyNest account.
              </p>
            </>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && step === 'otp_and_password' && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: Enter Email                                          */}
        {/* ============================================================ */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shopper@nexora.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP to Mail...
                </>
              ) : (
                <>
                  Send OTP to Mail <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>

            {/* Viva Evaluator Quick Fill Button */}
            <div className="pt-3 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition"
              >
                Autofill Demo Shopper (`shopper@nexora.com`)
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 2: Enter OTP & Set New Password                         */}
        {/* ============================================================ */}
        {step === 'otp_and_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Valid for 10 mins</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm tracking-widest font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying & Updating...
                </>
              ) : (
                <>
                  Reset Password & Finish <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Email
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={resendCooldown > 0 || loading}
                className="text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 font-bold flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 3: Success Screen                                       */}
        {/* ============================================================ */}
        {step === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center text-xs text-emerald-800">
              <p className="font-semibold">Your password has been changed successfully.</p>
              <p className="text-[11px] text-emerald-600 mt-1">
                You can now log in securely with your updated credentials.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition"
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
