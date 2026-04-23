import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getMyWorkerProfile } from '@/services/workerService'
import { addWorkerSkill, removeWorkerSkill, addWorkerCategory, removeWorkerCategory, updateWorkerProfile, createWorkerProfile } from '@/services/api'
import { ArrowLeft, Briefcase, Award, Plus, Edit2, Trash2, Building, User, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

type WorkerType = 'PROFESSIONAL' | 'SKILLED' | null

export default function SkillsPage() {
  const [workerProfile, setWorkerProfile] = useState<any>(null)
  const [workerType, setWorkerType] = useState<WorkerType>(null)
  const [loading, setLoading] = useState(true)

  // Professional Worker Fields
  const [jobRole, setJobRole] = useState('')
  const [previousCompany, setPreviousCompany] = useState('')
  const [workType, setWorkType] = useState<'ONLINE' | 'OFFLINE' | 'BOTH'>('BOTH')
  const [availableLocation, setAvailableLocation] = useState('')
  const [techStack, setTechStack] = useState('')
  const [pricingType, setPricingType] = useState<'PER_HOUR' | 'PER_DAY' | 'PER_PROJECT'>('PER_HOUR')
  const [rate, setRate] = useState('')
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE')
  const [upiId, setUpiId] = useState('')
  const [portfolioLink, setPortfolioLink] = useState('')
  const [linkedinLink, setLinkedinLink] = useState('')

  // Skilled Worker Fields
  const [jobType, setJobType] = useState('')
  const [experience, setExperience] = useState('')
  const [workLocation, setWorkLocation] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')

  // Skills & Categories
  const [newSkill, setNewSkill] = useState('')
  const [newCategory, setNewCategory] = useState('')

  // Modals
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState<{ type: 'skill' | 'category', value: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingItem, setDeletingItem] = useState<{ type: 'skill' | 'category', value: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWorkerProfile()
  }, [])

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true)
      const profile = await getMyWorkerProfile()
      if (profile) {
        setWorkerProfile(profile)
        // Don't auto-set worker type on load - let user select it first
        // setWorkerType(profile.subtype === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'SKILLED')
        setJobRole(profile.jobRole || '')
        setPreviousCompany(profile.bio || '')
        setWorkType(profile.workType || 'BOTH')
        setTechStack(profile.skills?.join(', ') || '')
        setPricingType(profile.pricingType || 'PER_HOUR')
        setRate(profile.rate?.toString() || '')
        setUpiId(profile.paymentUpi || '')
      }
    } catch (error) {
      console.error('Failed to fetch worker profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !workerProfile?.id) return
    
    try {
      const response = await addWorkerSkill(workerProfile.id, newSkill.trim())
      setWorkerProfile(response.data)
      setNewSkill('')
      toast.success('Skill added')
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to add skill')
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !workerProfile?.id) return
    
    try {
      const response = await addWorkerCategory(workerProfile.id, newCategory.trim())
      setWorkerProfile(response.data)
      setNewCategory('')
      toast.success('Category added')
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to add category')
    }
  }

  const handleEditItem = (type: 'skill' | 'category', value: string) => {
    setEditingItem({ type, value })
    setEditValue(value)
    setShowEditModal(true)
  }

  const handleUpdateItem = async () => {
    if (!editingItem || !editValue.trim() || !workerProfile?.id) return

    try {
      if (editingItem.type === 'skill') {
        await removeWorkerSkill(workerProfile.id, editingItem.value)
        const response = await addWorkerSkill(workerProfile.id, editValue.trim())
        setWorkerProfile(response.data)
        toast.success('Skill updated')
      } else {
        await removeWorkerCategory(workerProfile.id, editingItem.value)
        const response = await addWorkerCategory(workerProfile.id, editValue.trim())
        setWorkerProfile(response.data)
        toast.success('Category updated')
      }
      setShowEditModal(false)
      setEditingItem(null)
      setEditValue('')
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to update')
    }
  }

  const handleDeleteItem = (type: 'skill' | 'category', value: string) => {
    setDeletingItem({ type, value })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem || !workerProfile?.id) return

    try {
      if (deletingItem.type === 'skill') {
        const response = await removeWorkerSkill(workerProfile.id, deletingItem.value)
        setWorkerProfile(response.data)
        toast.success('Skill removed')
      } else {
        const response = await removeWorkerCategory(workerProfile.id, deletingItem.value)
        setWorkerProfile(response.data)
        toast.success('Category removed')
      }
      setShowDeleteModal(false)
      setDeletingItem(null)
    } catch (error: any) {
      toast.error(error?.response?.data || 'Failed to remove')
    }
  }

  const handleSaveProfile = async () => {
    if (!workerType) {
      toast.error('Please select a worker type')
      return
    }

    if (!jobRole.trim() && !jobType.trim()) {
      toast.error('Please enter a job role or job type')
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        subtype: workerType,
        jobRole: workerType === 'PROFESSIONAL' ? jobRole : jobType,
        bio: workerType === 'PROFESSIONAL' ? previousCompany : experience,
        workType: workType,
        pricingType: pricingType,
        rate: rate ? parseFloat(rate) : 0,
        paymentUpi: upiId,
        yearsExperience: workerType === 'SKILLED' && yearsExperience ? parseInt(yearsExperience) : undefined,
      }

      // If no profile exists, create it; otherwise update it
      if (!workerProfile?.id) {
        const response = await createWorkerProfile(payload)
        setWorkerProfile(response.data)
        toast.success('Profile created successfully!')
      } else {
        await updateWorkerProfile(workerProfile.id, payload)
        toast.success('Profile updated successfully!')
      }
      
      // Refresh profile to get updated data
      await fetchWorkerProfile()
    } catch (error: any) {
      console.error('Failed to save profile:', error)
      toast.error(error?.response?.data || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/dashboard-worker" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-3 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#1e293b]">Manage Your Professional Profile</h1>
          <p className="text-sm text-[#475569] mt-1">Update your skills and work information</p>
        </div>

        {/* Worker Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-3">Select Your Worker Type</h2>
          <p className="text-sm text-gray-600 mb-4">Choose the category that best describes your professional profile</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setWorkerType('PROFESSIONAL')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                workerType === 'PROFESSIONAL'
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : workerType === 'SKILLED'
                  ? 'border-gray-200 opacity-50'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className={workerType === 'PROFESSIONAL' ? 'text-purple-600' : 'text-gray-400'} size={24} />
                <div>
                  <div className="font-semibold text-[#1e293b]">Professional Worker</div>
                  <div className="text-xs text-[#475569]">Certified professionals with formal training</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setWorkerType('SKILLED')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                workerType === 'SKILLED'
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : workerType === 'PROFESSIONAL'
                  ? 'border-gray-200 opacity-50'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className={workerType === 'SKILLED' ? 'text-purple-600' : 'text-gray-400'} size={24} />
                <div>
                  <div className="font-semibold text-[#1e293b]">Skilled Worker</div>
                  <div className="text-xs text-[#475569]">Everyday skilled services</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Professional Worker Form */}
        {workerType === 'PROFESSIONAL' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5"
          >
            <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Professional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g., Full Stack Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Company/Experience</label>
                <input
                  type="text"
                  value={previousCompany}
                  onChange={(e) => setPreviousCompany(e.target.value)}
                  placeholder="e.g., ABC Corp or Freelancing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>

              {(workType === 'OFFLINE' || workType === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Location</label>
                  <input
                    type="text"
                    value={availableLocation}
                    onChange={(e) => setAvailableLocation(e.target.value)}
                    placeholder="e.g., Bangalore, Hyderabad"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g., React, Node.js, Python"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type</label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="PER_HOUR">Per Hour</option>
                  <option value="PER_DAY">Per Day</option>
                  <option value="PER_PROJECT">Per Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              {paymentMode === 'ONLINE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID / Phone Number</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g., yourname@upi or 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Link (Optional)</label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">CV Upload (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                  <div className="text-gray-600 text-sm">
                    Click to upload CV (PDF, DOC - Max 5MB)
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving || !jobRole.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Skilled Worker Form */}
        {workerType === 'SKILLED' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5"
          >
            <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Skilled Worker Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <input
                  type="text"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  placeholder="e.g., Carpenter, Plumber, Electrician"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., XYZ Company or Freelancing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                <input
                  type="text"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="e.g., Mumbai, Pune"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type</label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="PER_HOUR">Per Hour</option>
                  <option value="PER_DAY">Per Day</option>
                  <option value="PER_PROJECT">Per Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              {paymentMode === 'ONLINE' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID / Phone Number</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g., yourname@upi or 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving || !jobType.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowEditModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Edit {editingItem?.type === 'skill' ? 'Skill' : 'Category'}
                  </h3>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateItem}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowDeleteModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Trash2 className="text-red-600" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete "<strong>{deletingItem?.value}</strong>"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}


