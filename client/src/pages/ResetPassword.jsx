import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import axios from 'axios'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) verifyToken(); else { setValidating(false); setTokenValid(false); }
  }, [token, email])

  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/password/validate-reset-token', { params: { token, email } })
      setTokenValid(response.data.valid)
    } catch (error) {
      setTokenValid(false)
      setErrors({ submit: error.response?.data?.error || 'Invalid token' })
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return setErrors({ submit: 'Passwords do not match' });
    setLoading(true)
    try {
      await axios.post('/api/password/reset-password', { token, email, ...formData })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Reset failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  if (validating) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!tokenValid) return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <div className="mb-12 animate-fade-in text-center">
        <div className="w-20 h-20 bg-red-500 rounded-[32px] flex items-center justify-center text-white mb-6 mx-auto shadow-2xl shadow-red-100">
          <XCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Link <span className="text-red-600">EXPIRED</span></h1>
        <p className="text-sm text-gray-400 font-bold mt-2">The reset link is no longer valid</p>
      </div>
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slide-up space-y-4">
        <Link to="/forgot-password" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 text-center block text-sm">REQUEST NEW LINK</Link>
        <Link to="/login" className="w-full py-4 text-center block text-[10px] font-black text-gray-400 uppercase tracking-widest">BACK TO LOGIN</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <div className="mb-12 animate-fade-in">
        <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-200 mb-6 mx-auto">
          <Lock size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-center text-gray-900 leading-tight">Create <br /><span className="text-blue-600">NEW PASSWORD</span></h1>
        <p className="text-center text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">For {email}</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'RESET PASSWORD'}
          </button>

          {errors.submit && <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.submit}</p>}
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-xl font-black text-gray-900">Success!</h2>
            <p className="text-sm text-gray-500">Your password is reset.</p>
          </div>
        </div>
      )}
    </div>
  )
}


export default ResetPassword