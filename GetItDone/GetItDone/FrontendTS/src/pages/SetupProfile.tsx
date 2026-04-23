import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { RoleType, WorkerType, saveUserDetails } from '@/services/api'

type ProviderForm = {
  roleType: RoleType
  workerType?: WorkerType | ''
  skills: string
  experience: number | ''
  pricing: string
  location: string
  description: string
}

type ClientForm = {
  roleType: RoleType
  nameOrCompany: string
  location: string
  serviceTypes: string
  description: string
}

export default function SetupProfile() {
  const navigate = useNavigate()
  const locationHook = useLocation()
  const [userId, setUserId] = useState<number | null>(null)
  const [role, setRole] = useState<RoleType | ''>('')
  const [workerType, setWorkerType] = useState<WorkerType | ''>('')

  const [providerForm, setProviderForm] = useState<ProviderForm>({
    roleType: 'SERVICE_PROVIDER',
    workerType: '',
    skills: '',
    experience: '',
    pricing: '',
    location: '',
    description: '',
  })

  const [clientForm, setClientForm] = useState<ClientForm>({
    roleType: 'CLIENT',
    nameOrCompany: '',
    location: '',
    serviceTypes: '',
    description: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.userId) setUserId(parsed.userId)
      } catch {}
    }
  }, [])

  const canSubmit = useMemo(() => {
    if (!userId) return false
    if (role === 'SERVICE_PROVIDER') {
      return !!workerType
    }
    if (role === 'CLIENT') return true
    return false
  }, [userId, role, workerType])

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!userId || !role) return
    try {
      if (role === 'SERVICE_PROVIDER') {
        await saveUserDetails({
          userId,
          roleType: 'SERVICE_PROVIDER',
          workerType: workerType as WorkerType,
          skills: providerForm.skills,
          experience: providerForm.experience === '' ? undefined : Number(providerForm.experience),
          pricing: providerForm.pricing,
          location: providerForm.location,
          description: providerForm.description,
        })
      } else {
        // Map client fields: name/company + service types folded into description/skills per backend schema
        await saveUserDetails({
          userId,
          roleType: 'CLIENT',
          skills: clientForm.serviceTypes,
          location: clientForm.location,
          description: `${clientForm.nameOrCompany}${clientForm.description ? ' - ' + clientForm.description : ''}`,
        })
      }
      navigate('/dashboard', { state: { message: 'Profile setup completed successfully.' }, replace: true })
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save details')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-6">Set up your profile</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button type="button" onClick={() => { setRole('SERVICE_PROVIDER'); }} className={`p-4 border rounded-lg text-left ${role === 'SERVICE_PROVIDER' ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200'}`}>
            <div className="font-medium">Service Provider</div>
            <p className="text-sm text-gray-500">Offer services and get hired</p>
          </button>
          <button type="button" onClick={() => { setRole('CLIENT'); }} className={`p-4 border rounded-lg text-left ${role === 'CLIENT' ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200'}`}>
            <div className="font-medium">Client</div>
            <p className="text-sm text-gray-500">Find providers for your needs</p>
          </button>
        </div>

        {role === 'SERVICE_PROVIDER' && (
          <div className="mt-6 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <button type="button" onClick={() => setWorkerType('PROFESSIONAL')} className={`px-4 py-2 rounded-full border ${workerType === 'PROFESSIONAL' ? 'bg-primary-50 border-primary-600 text-primary-700' : 'border-gray-200'}`}>Professional Worker</button>
              <button type="button" onClick={() => setWorkerType('EVERYDAY')} className={`px-4 py-2 rounded-full border ${workerType === 'EVERYDAY' ? 'bg-primary-50 border-primary-600 text-primary-700' : 'border-gray-200'}`}>Everyday Worker</button>
            </div>
            <div>
              <label className="form-label">Skills</label>
              <input className="input-field" placeholder="e.g., Plumbing, UI Design" value={providerForm.skills} onChange={e => setProviderForm({ ...providerForm, skills: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Experience (years)</label>
                <input type="number" min={0} max={80} className="input-field" value={providerForm.experience} onChange={e => setProviderForm({ ...providerForm, experience: e.target.value === '' ? '' : Number(e.target.value) })} />
              </div>
              <div>
                <label className="form-label">Pricing (per hour/day/project)</label>
                <input className="input-field" placeholder="e.g., ₹500/hour" value={providerForm.pricing} onChange={e => setProviderForm({ ...providerForm, pricing: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="form-label">Location</label>
              <input className="input-field" value={providerForm.location} onChange={e => setProviderForm({ ...providerForm, location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea className="input-field h-28" value={providerForm.description} onChange={e => setProviderForm({ ...providerForm, description: e.target.value })} />
            </div>
          </div>
        )}

        {role === 'CLIENT' && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="form-label">Name/Company</label>
              <input className="input-field" value={clientForm.nameOrCompany} onChange={e => setClientForm({ ...clientForm, nameOrCompany: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input className="input-field" value={clientForm.location} onChange={e => setClientForm({ ...clientForm, location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Type of services required</label>
              <input className="input-field" placeholder="e.g., House cleaning, Web app" value={clientForm.serviceTypes} onChange={e => setClientForm({ ...clientForm, serviceTypes: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea className="input-field h-28" value={clientForm.description} onChange={e => setClientForm({ ...clientForm, description: e.target.value })} />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={!canSubmit} className="btn-primary disabled:opacity-50">Save and continue</button>
        </div>
      </form>
    </div>
  )
}


