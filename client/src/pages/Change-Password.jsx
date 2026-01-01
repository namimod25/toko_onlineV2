import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Key, Lock, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

const ChangePassword = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/password/change', formData)
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 2000)
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Failed to update' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <div className="mb-12 animate-fade-in">
        <div className="w-16 h-16 bg-purple-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-purple-200 mb-6 mx-auto">
          <Key size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-center text-gray-900 leading-tight">Security <br /><span className="text-purple-600">UPDATE</span></h1>
        <p className="text-center text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Change your password</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-purple-600 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-purple-600 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-purple-600 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'UPDATE PASSWORD'}
          </button>

          {errors.submit && <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.submit}</p>}
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/profile')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nevermind, go back</button>
        </div>
      </div>

      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-xl font-black text-gray-900">Success!</h2>
            <p className="text-sm text-gray-500">Your password is updated.</p>
          </div>
        </div>
      )}
    </div>
  )
}


export default ChangePassword