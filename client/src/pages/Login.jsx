import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginSchema } from '../../schemas/authSchema'
import { Eye, EyeOff, ShoppingBag, Mail, Lock, RefreshCw } from 'lucide-react';
import Captcha from '../components/Captcha'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCaptchaChange = (id, answer) => {
    setCaptchaId(id); setCaptchaAnswer(answer);
    if (errors.captcha) setErrors(prev => ({ ...prev, captcha: '' }))
  }

  const refreshCaptcha = () => {
    setCaptchaKey(prev => prev + 1); setCaptchaId(''); setCaptchaAnswer('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const loginData = { ...formData, captchaId, captchaAnswer }
      loginSchema.parse(loginData)
      setErrors({})
      const result = await login(formData.email, formData.password, captchaId, captchaAnswer)
      if (result.success) {
        navigate('/')
      } else {
        refreshCaptcha()
        setErrors({ submit: result.error })
      }
    } catch (error) {
      refreshCaptcha()
      if (error.errors) {
        const newErrors = {}
        error.errors.forEach(err => {
          if (err.path[0].includes('captcha')) newErrors.captcha = err.message
          else newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      }
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 pt-12">
      <div className="mb-12 animate-fade-in">
        <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-200 mb-6 mx-auto">
          <ShoppingBag className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black text-center text-gray-900 leading-tight">Welcome to <br /><span className="text-blue-600">LUXE STORE</span></h1>
        <p className="text-center text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Sign in to continue</p>
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
            <div className="flex justify-end mt-2 px-1">
              <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Forgot Password?</Link>
            </div>
          </div>

          <Captcha key={captchaKey} onCaptchaChange={handleCaptchaChange} error={errors.captcha} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'SIGN IN'}
          </button>

          {errors.submit && <p className="text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.submit}</p>}
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-bold">Don't have an account?</p>
          <Link to="/register" className="text-sm font-black text-blue-600 uppercase tracking-widest mt-1 inline-block">Join the family</Link>
        </div>
      </div>

      <div className="mt-auto pb-8 text-center pt-8">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest"> LUXE STORE © 2024 </p>
      </div>
    </div>
  )
}


export default Login