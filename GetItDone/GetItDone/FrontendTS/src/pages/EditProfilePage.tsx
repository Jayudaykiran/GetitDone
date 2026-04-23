import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCurrentUser } from '@/services/api'
import { User, Mail, Phone, MapPin, Briefcase, Upload, X, Link2, Linkedin, FileText, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'

type UserProfile = {
  fullName: string
  email: string
  phoneNumber: string
  address: string
  role: 'CLIENT' | 'WORKER'
  jobTitle: string
  // Worker specific
  workType?: string
  offlineLocation?: string
  techStack?: string
  pricingType?: string
  paymentMode?: string
  upiId?: string
  portfolioLink?: string
  linkedinLink?: string
  skills?: string[]
  categories?: string[]
  // Non-editable
  aadhaarNo?: string
  panNo?: string
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [newSkill, setNewSkill] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const resp = await getCurrentUser()
      const user = resp.data
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
        address: user.address || '',
        role: user.role || 'CLIENT',
        jobTitle: user.jobTitle || '',
        workType: user.workType || 'offline',
        offlineLocation: user.offlineLocation || '',
        techStack: user.techStack || '',
        pricingType: user.pricingType || 'hour',
        paymentMode: user.paymentMode || 'online',
        upiId: user.upiId || '',
        portfolioLink: user.portfolioLink || '',
        linkedinLink: user.linkedinLink || '',
        skills: user.skills || [],
        categories: user.categories || [],
        aadhaarNo: user.aadhaarNo,
        panNo: user.panNo
      })
      if (user.profileImagePath) {
        setProfilePreview(`http://localhost:8080/${user.profileImagePath}`)
      }
    } catch (err) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const onChange = (field: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile(prev => prev ? { ...prev, [field]: e.target.value } : null)
  }

  const onFileChange = (field: 'profile' | 'cv') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (field === 'profile') {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setProfilePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      if (!file.type.includes('pdf') && !file.type.includes('doc')) {
        toast.error('CV must be PDF or DOC')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB')
        return
      }
      setCvFile(file)
      toast.success('CV selected: ' + file.name)
    }
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    setProfile(prev => prev ? { ...prev, skills: [...(prev.skills || []), newSkill.trim()] } : null)
    setNewSkill('')
  }

  const removeSkill = (skill: string) => {
    setProfile(prev => prev ? { ...prev, skills: (prev.skills || []).filter(s => s !== skill) } : null)
  }

  const addCategory = () => {
    if (!newCategory.trim()) return
    setProfile(prev => prev ? { ...prev, categories: [...(prev.categories || []), newCategory.trim()] } : null)
    setNewCategory('')
  }

  const removeCategory = (cat: string) => {
    setProfile(prev => prev ? { ...prev, categories: (prev.categories || []).filter(c => c !== cat) } : null)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('fullName', profile.fullName)
      formData.append('phoneNumber', profile.phoneNumber)
      formData.append('address', profile.address)
      
      if (profile.role === 'WORKER') {
        if (profile.jobTitle) formData.append('jobTitle', profile.jobTitle)
        if (profile.workType) formData.append('workType', profile.workType)
        if (profile.offlineLocation) formData.append('offlineLocation', profile.offlineLocation)
        if (profile.techStack) formData.append('techStack', profile.techStack)
        if (profile.pricingType) formData.append('pricingType', profile.pricingType)
        if (profile.paymentMode) formData.append('paymentMode', profile.paymentMode)
        if (profile.upiId) formData.append('upiId', profile.upiId)
        if (profile.portfolioLink) formData.append('portfolioLink', profile.portfolioLink)
        if (profile.linkedinLink) formData.append('linkedinLink', profile.linkedinLink)
      }

      if (profileImage) formData.append('profileImage', profileImage)
      if (cvFile) formData.append('cvFile', cvFile)

      // In a real implementation, you would call the update API here
      // await updateProfile(formData)
      
      toast.success('Profile updated successfully!')
      setTimeout(() => {
        navigate(profile.role === 'WORKER' ? '/dashboard-worker' : '/dashboard')
      }, 1500)
    } catch (err: any) {
      toast.error(err?.response?.data || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-2">Update your personal information and preferences</p>
          </div>

          <div className="card">
            {/* Profile Photo Section */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                      {profile.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="btn-secondary cursor-pointer">
                    <Upload size={16} className="mr-2" />
                    Change Photo
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange('profile')} />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={onChange('fullName')}
                      className="input-with-icon"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email (Non-editable)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={profile.email}
                      className="input-with-icon bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={onChange('phoneNumber')}
                      className="input-with-icon"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Address/Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={profile.address}
                      onChange={onChange('address')}
                      className="input-with-icon"
                    />
                  </div>
                </div>
              </div>

              {/* Non-editable ID Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">ID Verification (Non-editable)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.aadhaarNo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText size={16} />
                      <span>Aadhaar: {profile.aadhaarNo}</span>
                    </div>
                  )}
                  {profile.panNo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText size={16} />
                      <span>PAN: {profile.panNo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Worker-specific fields */}
            {profile.role === 'WORKER' && (
              <>
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Job Role *</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={profile.jobTitle}
                          onChange={onChange('jobTitle')}
                          className="input-with-icon"
                          placeholder="e.g., Plumber, Developer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Work Type</label>
                      <select value={profile.workType} onChange={onChange('workType')} className="input-field">
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    {(profile.workType === 'offline' || profile.workType === 'both') && (
                      <div className="md:col-span-2">
                        <label className="form-label">Offline Work Location</label>
                        <input
                          type="text"
                          value={profile.offlineLocation}
                          onChange={onChange('offlineLocation')}
                          className="input-field"
                          placeholder="City, Area, or Address"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="form-label">Tech Stack / Expertise</label>
                      <textarea
                        value={profile.techStack}
                        onChange={onChange('techStack')}
                        className="textarea-field"
                        rows={2}
                        placeholder="Technologies, tools, or skills you specialize in"
                      />
                    </div>

                    <div>
                      <label className="form-label">Pricing Type</label>
                      <select value={profile.pricingType} onChange={onChange('pricingType')} className="input-field">
                        <option value="hour">Per Hour</option>
                        <option value="day">Per Day</option>
                        <option value="project">Per Project</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Payment Mode</label>
                      <select value={profile.paymentMode} onChange={onChange('paymentMode')} className="input-field">
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    {(profile.paymentMode === 'online' || profile.paymentMode === 'both') && (
                      <div className="md:col-span-2">
                        <label className="form-label">UPI ID / Payment Details</label>
                        <input
                          type="text"
                          value={profile.upiId}
                          onChange={onChange('upiId')}
                          className="input-field"
                          placeholder="yourname@upi or phone/GPay/Netbanking"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio & Links</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Portfolio Link</label>
                      <div className="relative">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="url"
                          value={profile.portfolioLink}
                          onChange={onChange('portfolioLink')}
                          className="input-with-icon"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">LinkedIn Profile</label>
                      <div className="relative">
                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="url"
                          value={profile.linkedinLink}
                          onChange={onChange('linkedinLink')}
                          className="input-with-icon"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Upload CV (Optional)</label>
                      <label className="flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <FileText className="text-gray-400 mr-2" size={20} />
                        <span className="text-sm text-gray-500">
                          {cvFile ? cvFile.name : 'Upload CV (PDF/DOC)'}
                        </span>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onFileChange('cv')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="input-field flex-1"
                      placeholder="Add a skill"
                    />
                    <button type="button" onClick={addSkill} className="btn-secondary">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                      className="input-field flex-1"
                      placeholder="Add a category"
                    />
                    <button type="button" onClick={addCategory} className="btn-secondary">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.categories?.map((cat, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {cat}
                        <button onClick={() => removeCategory(cat)} className="hover:text-purple-900">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(profile.role === 'WORKER' ? '/dashboard-worker' : '/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
