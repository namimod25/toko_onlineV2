import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { registerSchema } from '../../schemas/authSchema'
import { Eye, EyeOff, User, Mail, Lock, RefreshCw } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...formData, role: 'CUSTOMER' };
    setIsLoading(true)
    try {
      registerSchema.parse(submitData)
      setErrors({})
      const result = await register(submitData)
      if (result.success) {
        navigate('/')
      } else {
        setErrors({ submit: result.error })
      }
    } catch (error) {
      if (error.errors) {
        const newErrors = {}
        error.errors.forEach(err => { newErrors[err.path[0]] = err.message })
        setErrors(newErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <div className="mb-12 animate-fade-in">
        <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-200 mb-6 mx-auto">
          <User size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-center text-gray-900 leading-tight">Create your <br /><span className="text-blue-600">LUXE ACCOUNT</span></h1>
        <p className="text-center text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Join us today</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.password}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block px-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 mt-1 px-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'CREATE ACCOUNT'}
          </button>

          {errors.submit && <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.submit}</p>}
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-bold">Already part of the family?</p>
          <Link to="/login" className="text-sm font-black text-blue-600 uppercase tracking-widest mt-1 inline-block">Sign in</Link>
        </div>
      </div>

      <div className="mt-auto pb-8 text-center pt-8">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest"> LUXE STORE © 2024 </p>
      </div>
    </div>
  )
}

export default Register