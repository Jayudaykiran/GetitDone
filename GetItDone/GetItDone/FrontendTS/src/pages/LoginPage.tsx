import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMyWorkerProfile } from '@/services/workerService'

type FormState = {
  identifier: string // email or mobile
  password: string
}

export default function LoginPage() {
  const [form, setForm] = useState<FormState>({ identifier: '', password: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const auth = useAuth()

  const isEmail = (v: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v)
  const isPhone = (v: string) => /^\d{10}$/.test(v)

  const validate = () => {
    const e: Partial<FormState> = {}
    if (!isEmail(form.identifier) && !isPhone(form.identifier)) 
      e.identifier = 'Enter valid email or 10-digit mobile'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onChange = (k: keyof FormState) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: ev.target.value })
    if (errors[k]) setErrors({ ...errors, [k]: undefined })
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await auth.login(form.identifier, form.password)
      toast.success('Welcome back!')
      // Navigate based on user role
      const stored = localStorage.getItem('auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        const role = parsed.role
        if (role === 'WORKER' || role === 'PROFESSIONAL_WORKER') {
          // Check if worker has a profile, if not redirect to skills page
          try {
            const profile = await getMyWorkerProfile()
            if (!profile) {
              // First login - no profile exists yet
              toast.success('Welcome! Please complete your profile to get started.')
              navigate('/skills', { replace: true })
            } else {
              navigate('/dashboard-worker', { replace: true })
            }
          } catch (error) {
            // If there's an error checking profile, redirect to skills page to be safe
            navigate('/skills', { replace: true })
          }
        } else {
          navigate('/dashboard-client', { replace: true })
        }
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      toast.error(err?.response?.data || err?.message || 'Login failed')
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
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">Welcome Back</h1>
          <p className="text-[#475569] text-lg">Sign in to continue to GetItDone</p>
        </motion.div>

        {/* Login Form */}
        <motion.form 
          onSubmit={onSubmit} 
          className="card shadow-2xl border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-5">
            {/* Email/Phone Input */}
            <div>
              <label className="form-label">Email or Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input 
                  className={`input-field pl-12 ${errors.identifier ? 'border-red-500 focus:ring-red-500' : ''}`} 
                  value={form.identifier} 
                  onChange={onChange('identifier')}
                  placeholder="Enter email or phone"
                />
              </div>
              {errors.identifier && <p className="error-message">{errors.identifier}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input 
                  type="password" 
                  className={`input-field pl-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`} 
                  value={form.password} 
                  onChange={onChange('password')}
                  placeholder="Enter password"
                />
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
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
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <Link 
              to="/forgot-password" 
              className="text-sm text-[#2563eb] font-medium hover:text-[#1d4ed8] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-[#475569] mt-6">
            Don't have an account?{' '}
            <Link className="text-[#2563eb] font-semibold hover:text-[#1d4ed8] transition-colors" to="/register">
              Create Account
            </Link>
          </p>
        </motion.form>

        {/* Footer */}
        <motion.p 
          className="text-center text-xs text-[#475569] mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  )
}



