import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Rupiah } from '../utils/Currency'
import { socketService } from '../utils/socket'
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Package,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react'
import { RupiahCurency } from '../utils/Currency'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [realTimeUpdates, setRealTimeUpdates] = useState(0)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProductDetail()
    setupSocketListeners()
    return () => {
      const socket = socketService.getSocket()
      if (socket) {
        socket.off(`product-detail-updated-${id}`)
        socket.off(`product-detail-deleted-${id}`)
        socket.off(`product-stock-updated-${id}`)
      }
    }
  }, [id, user, navigate])

  const setupSocketListeners = () => {
    const socket = socketService.connect()
    socket.emit('join-product-room', id)
    socket.on(`product-detail-updated-${id}`, (updatedProduct) => {
      setProduct(updatedProduct)
      setRealTimeUpdates(prev => prev + 1)
      showNotification('Product updated!')
    })
    socket.on(`product-detail-deleted-${id}`, () => {
      showNotification('Product removed')
      setTimeout(() => navigate('/products'), 2000)
    })
    socket.on(`product-stock-updated-${id}`, ({ stock }) => {
      setProduct(prev => prev ? { ...prev, stock } : null)
      setRealTimeUpdates(prev => prev + 1)
      showNotification(`Stock updated: ${stock}`)
    })
  }

  const showNotification = (message) => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 left-4 right-4 glass bg-blue-600/90 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 animate-fade-in flex items-center justify-center border border-white/20'
    notification.innerHTML = `<span class="font-bold text-sm">${message}</span>`
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 2500)
  }

  const fetchProductDetail = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/products/${id}`)
      setProduct(response.data)
      fetchRelatedProducts(response.data.category)
    } catch (error) {
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await axios.get('/api/products')
      const related = response.data.filter(p => p.category === category && p.id !== parseInt(id)).slice(0, 4)
      setRelatedProducts(related)
    } catch (error) { }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) setQuantity(newQuantity)
  }

  const addToCart = async () => {
    if (!product || product.stock === 0) return
    try {
      await axios.post('/api/cart/add', { productId: product.id, quantity })
      showNotification(`Added ${quantity} to cart!`)
    } catch (error) {
      showNotification('Failed to add to cart')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-white text-center">
      <Package size={64} className="text-gray-200 mb-4" />
      <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
      <Link to="/" className="text-blue-600 font-bold">Return Home</Link>
    </div>
  )

  const productImages = [
    product.image,
    product.image.replace('300x200', '400x300'),
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
  ]

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header Actions */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center pointer-events-none md:hidden">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center pointer-events-auto">
          <ArrowLeft size={20} />
        </button>
        <button className="w-10 h-10 glass rounded-full flex items-center justify-center pointer-events-auto">
          <Share2 size={20} />
        </button>
      </div>

      {/* Hero Gallery */}
      <div className="relative h-[40vh] md:h-[60vh] bg-gray-100 overflow-hidden">
        <img
          src={productImages[selectedImage]}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {productImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`h-1.5 rounded-full transition-all ${selectedImage === i ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-12 -mt-8 bg-white rounded-t-[40px] relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">{product.category}</p>
            <h1 className="text-2xl md:text-5xl font-black text-gray-900 leading-tight">{product.name}</h1>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-xl">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-yellow-700">4.5</span>
          </div>
        </div>

        <div className="flex items-end gap-3 mb-8">
          <span className="text-3xl md:text-5xl font-black text-blue-600">{Rupiah(product.price)}</span>
          <span className="text-sm text-gray-400 font-medium mb-1.5 strike-through decoration-red-500">
            {Rupiah(product.price * 1.2)}
          </span>
        </div>

        <div className="mb-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Description</h3>
          <p className="text-gray-500 leading-relaxed text-sm md:text-lg">{product.description}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
            <Truck size={20} className="text-blue-500 mb-2" />
            <p className="text-[10px] font-bold text-gray-400 uppercase">Shipping</p>
            <p className="text-xs font-bold">Free delivery</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
            <Shield size={20} className="text-green-500 mb-2" />
            <p className="text-[10px] font-bold text-gray-400 uppercase">Warranty</p>
            <p className="text-xs font-bold">24 Months</p>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between mb-10 lg:w-1/3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Quantity</h3>
            <p className="text-[10px] text-gray-400 font-medium">{product.stock} units available</p>
          </div>
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-blue-600 disabled:opacity-50"
              disabled={quantity <= 1}
            >-</button>
            <span className="font-bold text-lg min-w-[20px] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-blue-600 disabled:opacity-50"
              disabled={quantity >= product.stock}
            >+</button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 md:pb-4 glass border-t border-white/20 z-50">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="w-16 h-16 bg-blue-50 rounded-[24px] flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 active:scale-95 transition-transform disabled:opacity-50"
          >
            <ShoppingCart size={24} />
          </button>
          <button
            disabled={product.stock === 0}
            className="flex-1 bg-blue-600 text-white font-black rounded-[24px] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {product.stock === 0 ? 'SOLD OUT' : 'BUY NOW'}
          </button>
        </div>
      </div>
    </div>
  )
}


export default ProductDetail