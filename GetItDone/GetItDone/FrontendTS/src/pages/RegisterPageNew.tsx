import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, Phone, Lock, Upload, X, Calendar, Wallet, MapPin, Briefcase, FileText, Link2, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

type FormState = {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  role: 'CLIENT' | 'WORKER'
  aadhaarOrPanNumber: string
  upiId: string
  dob: string
  address: string
  jobTitle: string
  professionalWorker: boolean
  // Files
  profileImage: File | null
  idDocumentImage: File | null
  cvFile: File | null
  // Professional Worker fields
  portfolioLink: string
  linkedinLink: string
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({ 
    fullName: '', 
    email: '', 
    phoneNumber: '', 
    password: '',
    role: 'CLIENT',
    aadhaarOrPanNumber: '',
    upiId: '',
    dob: '',
    address: '',
    jobTitle: '',
    professionalWorker: false,
    profileImage: null,
    idDocumentImage: null,
    cvFile: null,
    portfolioLink: '',
    linkedinLink: ''
  })
  
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const auth = useAuth()

  const validate = () => {
    const e: Partial<Record<string, string>> = {}
    
    // Required fields
    if (!form.fullName.trim()) e.fullName = 'Name is required'
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) e.email = 'Invalid email'
    if (!/^\d{10}$/.test(form.phoneNumber)) e.phoneNumber = 'Must be 10 digits'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    
    // Mandatory: UPI ID
    if (!form.upiId.trim()) e.upiId = 'UPI ID is required'
    
    // Mandatory: Date of Birth
    if (!form.dob) e.dob = 'Date of Birth is required'
    if (form.dob && new Date(form.dob) > new Date()) e.dob = 'Invalid date'
    
    // Mandatory: Aadhaar or PAN
    if (!form.aadhaarOrPanNumber.trim()) {
      e.aadhaarOrPanNumber = 'Aadhaar or PAN number is required'
    }
    
    // Mandatory: Profile Image
    if (!form.profileImage) e.profileImage = 'Profile photo is required'
    
    // Mandatory: ID Document Image
    if (!form.idDocumentImage) e.idDocumentImage = 'Aadhaar/PAN card photo is required'
    
    // Worker-specific validation
    if (form.role === 'WORKER' && !form.jobTitle.trim()) e.jobTitle = 'Job title is required for workers'
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onChange = (k: keyof Omit<FormState, 'profileImage' | 'idDocumentImage' | 'cvFile' | 'professionalWorker'>) => (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [k]: ev.target.value })
    // Clear error for this field when user types
    const newErrors = { ...errors }
    delete newErrors[k]
    setErrors(newErrors)
    // Dismiss all toasts when user starts typing
    toast.dismiss()
  }

  const onFileChange = (field: 'profileImage' | 'idDocumentImage' | 'cvFile') => (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (file) {
      // Validate file type
      if (field === 'cvFile') {
        if (!file.type.includes('pdf') && !file.type.includes('doc')) {
          toast.error('CV must be PDF or DOC file')
          return
        }
      } else {
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload an image file')
          return
        }
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      setForm({ ...form, [field]: file })
      setErrors({ ...errors, [field]: undefined })
      
      // Create preview for images
      if (field !== 'cvFile') {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (field === 'profileImage') {
            setProfilePreview(reader.result as string)
          } else if (field === 'idDocumentImage') {
            setIdDocPreview(reader.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removeFile = (field: 'profileImage' | 'idDocumentImage' | 'cvFile') => () => {
    setForm({ ...form, [field]: null })
    if (field === 'profileImage') setProfilePreview(null)
    if (field === 'idDocumentImage') setIdDocPreview(null)
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('fullName', form.fullName)
      formData.append('email', form.email)
      formData.append('password', form.password)
      formData.append('phoneNumber', form.phoneNumber)
      formData.append('role', form.role)
      formData.append('upiId', form.upiId)
      formData.append('dob', form.dob)
      formData.append('aadhaarOrPanNumber', form.aadhaarOrPanNumber)
      
      // Add optional fields
      if (form.address) formData.append('address', form.address)
      if (form.role === 'WORKER' && form.jobTitle) formData.append('jobTitle', form.jobTitle)
      
      // Add files (mandatory)
      if (form.profileImage) formData.append('profileImage', form.profileImage)
      if (form.idDocumentImage) formData.append('idDocumentImage', form.idDocumentImage)
      
      // Professional Worker fields
      if (form.professionalWorker && form.role === 'WORKER') {
        formData.append('professionalWorker', 'true')
        if (form.cvFile) formData.append('cvFile', form.cvFile)
        if (form.portfolioLink) formData.append('portfolioLink', form.portfolioLink)
        if (form.linkedinLink) formData.append('linkedinLink', form.linkedinLink)
      }
      
      const response = await auth.register(formData)
      const message = (response as any)?.message || 'User registered successfully!'
      toast.success('🎉 ' + message)
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      console.error('Registration error:', err)
      let errorMessage = 'Registration failed'
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message
        }
      } else if (err?.message) {
        errorMessage = err.message
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Brand */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-secondary rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">Create Account</h1>
          <p className="text-[#475569] text-lg">Join GetItDone and start connecting</p>
        </motion.div>

        {/* Register Form */}
        <motion.form 
          onSubmit={onSubmit} 
          className="card shadow-2xl border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Role Selection */}
          <div className="mb-6">
            <label className="form-label">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'CLIENT', professionalWorker: false })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  form.role === 'CLIENT' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <User className={`mx-auto mb-2 ${form.role === 'CLIENT' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${form.role === 'CLIENT' ? 'text-blue-600' : 'text-gray-600'}`}>Client</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'WORKER' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  form.role === 'WORKER' 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <Briefcase className={`mx-auto mb-2 ${form.role === 'WORKER' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${form.role === 'WORKER' ? 'text-purple-600' : 'text-gray-600'}`}>Worker</span>
              </button>
            </div>
          </div>

          {/* Professional Worker Toggle */}
          {form.role === 'WORKER' && (
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.professionalWorker}
                  onChange={(e) => setForm({ ...form, professionalWorker: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">I am a Professional Worker</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-8">Professional workers can upload CV, portfolio, and LinkedIn profile</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="form-label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  value={form.fullName}
                  onChange={onChange('fullName')}
                  className="input-with-icon"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="error-message">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email"
                  value={form.email}
                  onChange={onChange('email')}
                  className="input-with-icon"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="tel"
                  value={form.phoneNumber}
                  onChange={onChange('phoneNumber')}
                  className="input-with-icon"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password"
                  value={form.password}
                  onChange={onChange('password')}
                  className="input-with-icon"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="form-label">Date of Birth *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="date"
                  value={form.dob}
                  onChange={onChange('dob')}
                  className="input-with-icon"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.dob && <p className="error-message">{errors.dob}</p>}
            </div>

            {/* UPI ID */}
            <div>
              <label className="form-label">UPI ID *</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  value={form.upiId}
                  onChange={onChange('upiId')}
                  className="input-with-icon"
                  placeholder="yourname@upi"
                />
              </div>
              {errors.upiId && <p className="error-message">{errors.upiId}</p>}
            </div>

            {/* Aadhaar or PAN Number */}
            <div className="md:col-span-2">
              <label className="form-label">Aadhaar or PAN Number *</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  value={form.aadhaarOrPanNumber}
                  onChange={onChange('aadhaarOrPanNumber')}
                  className="input-with-icon"
                  placeholder="Aadhaar (12 digits) or PAN (10 chars)"
                />
              </div>
              {errors.aadhaarOrPanNumber && <p className="error-message">{errors.aadhaarOrPanNumber}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="form-label">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                <textarea 
                  value={form.address}
                  onChange={onChange('address')}
                  className="textarea-field pl-12"
                  placeholder="Your address"
                  rows={2}
                />
              </div>
            </div>

            {/* Job Title (Worker only) */}
            {form.role === 'WORKER' && (
              <div className="md:col-span-2">
                <label className="form-label">Job Title *</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text"
                    value={form.jobTitle}
                    onChange={onChange('jobTitle')}
                    className="input-with-icon"
                    placeholder="e.g., Plumber, Developer, Designer"
                  />
                </div>
                {errors.jobTitle && <p className="error-message">{errors.jobTitle}</p>}
              </div>
            )}
          </div>

          {/* File Uploads Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Image */}
              <div>
                <label className="form-label">Profile Photo *</label>
                <div className="relative">
                  {!profilePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-500">Upload Profile Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={onFileChange('profileImage')} />
                    </label>
                  ) : (
                    <div className="relative">
                      <img src={profilePreview} alt="Profile Preview" className="w-full h-32 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={removeFile('profileImage')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {errors.profileImage && <p className="error-message">{errors.profileImage}</p>}
              </div>

              {/* ID Document Image */}
              <div>
                <label className="form-label">Aadhaar/PAN Card Photo *</label>
                <div className="relative">
                  {!idDocPreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-500">Upload ID Document</span>
                      <input type="file" className="hidden" accept="image/*" onChange={onFileChange('idDocumentImage')} />
                    </label>
                  ) : (
                    <div className="relative">
                      <img src={idDocPreview} alt="ID Preview" className="w-full h-32 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={removeFile('idDocumentImage')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {errors.idDocumentImage && <p className="error-message">{errors.idDocumentImage}</p>}
              </div>
            </div>
          </div>

          {/* Professional Worker Additional Fields */}
          {form.professionalWorker && form.role === 'WORKER' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details (Optional)</h3>
              
              <div className="space-y-4">
                {/* CV Upload */}
                <div>
                  <label className="form-label">Upload CV</label>
                  <div className="relative">
                    {!form.cvFile ? (
                      <label className="flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                        <FileText className="text-gray-400 mr-2" size={20} />
                        <span className="text-sm text-gray-500">Upload CV (PDF/DOC)</span>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onFileChange('cvFile')} />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3 border-2 border-purple-200 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FileText className="text-purple-600" size={20} />
                          <span className="text-sm text-gray-700">{form.cvFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile('cvFile')}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio Link */}
                <div>
                  <label className="form-label">Portfolio Link</label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="url"
                      value={form.portfolioLink}
                      onChange={onChange('portfolioLink')}
                      className="input-with-icon"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                {/* LinkedIn Link */}
                <div>
                  <label className="form-label">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="url"
                      value={form.linkedinLink}
                      onChange={onChange('linkedinLink')}
                      className="input-with-icon"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign In
            </Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  )
}
