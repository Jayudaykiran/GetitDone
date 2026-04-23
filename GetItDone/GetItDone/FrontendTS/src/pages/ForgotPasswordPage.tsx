import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

type Step = 'identify' | 'reset'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('identify')
  const [identifier, setIdentifier] = useState('') // email or phone
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const isEmail = (v: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v)
  const isPhone = (v: string) => /^\d{10}$/.test(v)

  const validateIdentifier = () => {
    const e: Record<string, string> = {}
    if (!isEmail(identifier) && !isPhone(identifier)) {
      e.identifier = 'Enter valid email or 10-digit mobile number'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePasswords = () => {
    const e: Record<string, string> = {}
    if (newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters'
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateIdentifier()) return

    setLoading(true)
    try {
      // Check if user exists
      const response = await api.post('/auth/check-user', { 
        identifier 
      })
      
      if (response.data.exists) {
        toast.success('User found! Please enter your new password')
        setStep('reset')
      } else {
        toast.error('No account found with this email/phone number')
      }
    } catch (err: any) {
      toast.error(err?.response?.data || 'Error checking user')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswords()) return

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        identifier,
        newPassword
      })
      
      toast.success('Password reset successful! Please login with your new password')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      toast.error(err?.response?.data || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Brand */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">
            {step === 'identify' ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p className="text-[#475569] text-lg">
            {step === 'identify' 
              ? 'Enter your email or phone to continue' 
              : 'Enter your new password'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          className="card shadow-2xl border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {step === 'identify' ? (
            <form onSubmit={handleCheckUser}>
              <div className="space-y-5">
                {/* Email/Phone Input */}
                <div>
                  <label className="form-label">Email or Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {isEmail(identifier) ? <Mail className="text-gray-400" size={20} /> : <Phone className="text-gray-400" size={20} />}
                    </div>
                    <input 
                      className={`input-field pl-12 ${errors.identifier ? 'border-red-500 focus:ring-red-500' : ''}`} 
                      value={identifier} 
                      onChange={e => {
                        setIdentifier(e.target.value)
                        setErrors({})
                      }}
                      placeholder="Enter email or phone"
                    />
                  </div>
                  {errors.identifier && <p className="error-message">{errors.identifier}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button 
                disabled={loading} 
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="form-label">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input 
                      type="password"
                      className={`input-field pl-12 ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`} 
                      value={newPassword} 
                      onChange={e => {
                        setNewPassword(e.target.value)
                        setErrors({})
                      }}
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  {errors.newPassword && <p className="error-message">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="form-label">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input 
                      type="password"
                      className={`input-field pl-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`} 
                      value={confirmPassword} 
                      onChange={e => {
                        setConfirmPassword(e.target.value)
                        setErrors({})
                      }}
                      placeholder="Re-enter new password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setStep('identify')}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <motion.button 
                  disabled={loading} 
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}

          {/* Back to Login Link */}
          <p className="text-center text-sm text-[#475569] mt-6">
            Remember your password?{' '}
            <Link className="text-[#2563eb] font-semibold hover:text-[#1d4ed8] transition-colors" to="/login">
              Sign In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
