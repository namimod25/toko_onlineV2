import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Key, Copy, CheckCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetData, setResetData] = useState(null)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('/api/password/forgot-password', { email })
      setResetData(response.data); setSuccess(true)
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Failed to generate token' })
    } finally {
      setLoading(false)
    }
  }

  if (success && resetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
        <div className="mb-12 animate-fade-in text-center">
          <div className="w-20 h-20 bg-green-500 rounded-[32px] flex items-center justify-center text-white mb-6 mx-auto shadow-2xl shadow-green-100">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Token <span className="text-green-600">Generated</span></h1>
          <p className="text-sm text-gray-400 font-bold mt-2">Copy your reset token below</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slide-up">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-relaxed text-center">Development Mode: Token is shown here for testing.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
              <p className="text-sm font-bold text-gray-800">{resetData.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between gap-4 overflow-hidden">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reset Token</p>
                <p className="text-sm font-mono font-bold text-blue-600 truncate">{resetData.resetToken}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(resetData.resetToken); alert('Token copied!'); }} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex flex-shrink-0 items-center justify-center">
                <Copy size={18} />
              </button>
            </div>
          </div>

          <Link
            to={`/reset-password?token=${resetData.resetToken}&email=${encodeURIComponent(resetData.email)}`}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 text-center block text-sm uppercase tracking-widest"
          >
            Continue Reset
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <div className="mb-12 animate-fade-in">
        <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-200 mb-6 mx-auto">
          <Key size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-center text-gray-900 leading-tight">Forgot <br /><span className="text-blue-600">PASSWORD?</span></h1>
        <p className="text-center text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">No worries, we'll help you</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'SEND RESET TOKEN'}
          </button>

          {errors.submit && <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.submit}</p>}
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowLeft size={10} strokeWidth={3} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}


export default ForgotPassword