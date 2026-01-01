import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Rupiah } from '../utils/Currency'
import { socketService } from '../utils/socket'
import { Search, Filter, X } from 'lucide-react'

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    setupSocketListeners()
    return () => {
      const socket = socketService.getSocket()
      if (socket) {
        socket.off('stock-updated')
      }
    }
  }, [user])

  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory])

  const setupSocketListeners = () => {
    const socket = socketService.connect()
    socket.on('stock-updated', ({ productId, stock }) => {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock } : p))
    })
  }

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products')
      setProducts(response.data)
      setFilteredProducts(response.data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1 })
    } catch (error) {
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Search Header */}
      <div className="px-6 pt-6 mb-6">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Our <span className="text-blue-600">Collection</span></h1>

        <div className="mt-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-600 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>
          <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-800 shadow-sm border border-gray-100">
            <Filter size={20} />
          </button>
        </div>

        {/* Categories Scroller */}
        <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-400 border border-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-12 px-10 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center text-gray-300 mb-6">
            <ShoppingCart size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-800">No results found</h3>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4 pb-20">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 animate-fade-in focus-within:ring-2 focus-within:ring-blue-600">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=LUXE" }}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.stock === 0 && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full border border-white/20">Sold Out</span>
                  )}
                  {product.stock > 0 && product.stock < 5 && (
                    <span className="bg-orange-500/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full border border-white/20">Low Stock</span>
                  )}
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors">
                  <Heart size={14} fill={false ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="p-4">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 truncate">{product.category}</p>
                <h3 className="font-black text-gray-900 text-sm leading-tight mb-2 line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-black text-gray-900">{Rupiah(product.price)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                    disabled={product.stock === 0}
                    className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 active:scale-90 transition-all disabled:bg-gray-200 disabled:shadow-none"
                  >
                    <ShoppingCart size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



export default Products