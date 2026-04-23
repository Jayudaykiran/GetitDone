import { useState } from 'react'
import { FiSearch, FiCalendar, FiClock } from 'react-icons/fi'

type SearchPayload = {
  jobTitle?: string
  name?: string
  userCode?: string
  startDateTime?: string
  endDateTime?: string
}

export default function SearchBar({ onSearch }: { onSearch: (payload: SearchPayload) => void }) {
  const [jobTitle, setJobTitle] = useState('')
  const [name, setName] = useState('')
  const [userCode, setUserCode] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const submit = () => {
    let startDateTime: string | undefined
    let endDateTime: string | undefined
    if (date && startTime && endTime) {
      startDateTime = new Date(`${date}T${startTime}:00`).toISOString()
      endDateTime = new Date(`${date}T${endTime}:00`).toISOString()
    }
    onSearch({ jobTitle, name, userCode, startDateTime, endDateTime })
  }

  const clearAll = () => {
    setJobTitle('')
    setName('')
    setUserCode('')
    setDate('')
    setStartTime('')
    setEndTime('')
    onSearch({})
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <FiSearch className="text-blue-600" size={24} />
        <h3 className="text-lg font-bold text-gray-900">Search Workers</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Job Title */}
        <div>
          <label className="form-label">Job Title</label>
          <input 
            value={jobTitle} 
            onChange={e => setJobTitle(e.target.value)} 
            placeholder="e.g. Plumber, Electrician" 
            className="input-field" 
          />
        </div>

        {/* Name */}
        <div>
          <label className="form-label">Worker Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Enter name" 
            className="input-field" 
          />
        </div>

        {/* User Code */}
        <div>
          <label className="form-label">User ID (26X)</label>
          <input 
            value={userCode} 
            onChange={e => setUserCode(e.target.value)} 
            placeholder="261, 262, etc." 
            className="input-field" 
          />
        </div>

        {/* Date */}
        <div>
          <label className="form-label flex items-center space-x-1">
            <FiCalendar size={14} />
            <span>Date</span>
          </label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="input-field" 
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="form-label flex items-center space-x-1">
            <FiClock size={14} />
            <span>Start Time</span>
          </label>
          <input 
            type="time" 
            value={startTime} 
            onChange={e => setStartTime(e.target.value)} 
            className="input-field" 
          />
        </div>

        {/* End Time */}
        <div>
          <label className="form-label flex items-center space-x-1">
            <FiClock size={14} />
            <span>End Time</span>
          </label>
          <input 
            type="time" 
            value={endTime} 
            onChange={e => setEndTime(e.target.value)} 
            className="input-field" 
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-6">
        <button 
          className="btn-secondary" 
          onClick={clearAll}
        >
          Clear All
        </button>
        <button 
          className="btn-primary flex items-center space-x-2" 
          onClick={submit}
        >
          <FiSearch />
          <span>Search Workers</span>
        </button>
      </div>
    </div>
  )
}
