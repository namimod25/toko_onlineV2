import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Calendar,
  Shield,
  Key,
  Save,
  X,
  MapPin,
  Phone,
  CheckCircle,
  LogOut,
  ArrowRight
} from 'lucide-react'
import axios from 'axios'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', country: '', postalCode: ''
  })
  const [errors, setErrors] = useState({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) fetchProfile(); else navigate('/login');
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile')
      setProfile(response.data)
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        country: response.data.country || '',
        postalCode: response.data.postalCode || ''
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      await axios.put('/api/profile', formData)
      setSuccessMessage('Profile updated!')
      setEditing(false)
      fetchProfile()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Update failed' })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-blue-600 p-8 pt-12 rounded-b-[40px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-[32px] flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl mb-4">
              <User size={40} className="text-white" />
            </div>
            <button className="absolute bottom-2 right-0 w-8 h-8 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Edit size={14} />
            </button>
          </div>
          <h2 className="text-2xl font-black">{profile?.name || 'User'}</h2>
          <p className="text-blue-100 text-sm font-medium">{profile?.email}</p>
        </div>
      </div>

      <div className="-mt-10 px-6 relative z-10">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Personal Details</h3>
            <button
              onClick={() => setEditing(!editing)}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl transition-all ${editing ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'
                }`}
            >
              {editing ? 'Cancel' : 'Edit Info'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 disabled:bg-transparent"
                />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Shipping Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows={2}
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 resize-none"
                  placeholder="Enter your street address"
                />
              </div>
            </div>

            {editing && (
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
              >
                {saveLoading ? 'UPDATING...' : 'SAVE CHANGES'}
              </button>
            )}
          </form>
        </div>

        <div className="space-y-4">
          <Link to="/change-password" title="Settings" className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <Key size={20} />
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-sm">Security</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Update password</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-300" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between group active:scale-95 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                <LogOut size={20} />
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-sm">Sign Out</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">End your session</p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center mt-12 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          LUXE STORE PREMIER
        </p>
      </div>

      {successMessage && (
        <div className="fixed bottom-28 left-6 right-6 z-50 animate-slide-up">
          <div className="glass bg-green-500 px-6 py-4 rounded-[24px] text-white text-center text-xs font-black shadow-2xl border border-white/20">
            {successMessage}
          </div>
        </div>
      )}
    </div>
  )
}



export default Profile