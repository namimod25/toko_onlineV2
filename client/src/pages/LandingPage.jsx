import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Rupiah } from '../utils/Currency'
import {
  ShoppingBag,
  Truck,
  Shield,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye
} from 'lucide-react'
import axios from 'axios'

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [heroSlides, setHeroSlides] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  const { user } = useAuth()

  useEffect(() => {
    fetchLandingData()
  }, [])

  // Auto slide hero
  useEffect(() => {
    if (heroSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [heroSlides.length])

  const fetchLandingData = async () => {
    try {
      setLoading(true)
      const [productsResponse, slidesResponse, categoriesResponse] = await Promise.all([
        axios.get('/api/landing/featured-products'),
        axios.get('/api/landing/hero-slides'),
        axios.get('/api/landing/categories')
      ])
      setFeaturedProducts(productsResponse.data)
      setHeroSlides(slidesResponse.data)
      setCategories(categoriesResponse.data)
    } catch (error) {
      console.error('Error fetching landing data:', error)
      setFeaturedProducts(getMockProducts())
      setHeroSlides(getMockSlides())
      setCategories(getMockCategories())
    } finally {
      setLoading(false)
    }
  }

  const getMockCategories = () => [
    { id: 'all', name: 'All Products', count: 8 },
    { id: 'Smartphone', name: 'Smartphone', count: 4 },
    { id: 'Laptop', name: 'Laptop', count: 2 },
    { id: 'Tablet', name: 'Tablet', count: 2 }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const toggleDescription = (productId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  const filteredProducts = featuredProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const truncateText = (text, maxLength, productId) => {
    const isExpanded = expandedDescriptions[productId]
    if (isExpanded || text.length <= maxLength) {
      return text
    }
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Optimized for Mobile */}
      <section className="relative h-[250px] md:h-[500px] overflow-hidden rounded-3xl mb-8 animate-fade-in mx-2 overflow-hidden shadow-2xl">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative h-full flex items-end justify-start p-6 text-white text-left">
              <div className="max-w-xl">
                <h1 className="text-2xl md:text-5xl font-extrabold mb-2 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm md:text-xl mb-6 text-gray-200 line-clamp-2 md:line-clamp-none">
                  {slide.description}
                </p>
                <div className="flex gap-3">
                  <Link
                    to={slide.buttonLink || (user ? "/products" : "/register")}
                    className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition"
                  >
                    {slide.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Decorative elements for mobile feel */}
        <div className="absolute top-4 right-4 z-10">
          <div className="glass px-3 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
            New Season
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="mb-10 overflow-hidden">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-bold">Categories</h2>
          <button className="text-xs font-semibold text-blue-600 uppercase tracking-wider">See All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 snap-start px-6 py-2.5 rounded-2xl font-semibold transition-all shadow-sm ${selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="pb-24">
        <div className="px-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Recommended</h2>
              <p className="text-xs text-gray-500 font-medium">Selected for your style</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><Filter size={18} className="text-gray-600" /></button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full animate-fade-in"
                >
                  <div className="relative aspect-square overflow-hidden m-2 rounded-[28px]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Image" }}
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Sold Out
                        </span>
                      </div>
                    )}
                    {product.rating && (
                      <div className="absolute top-3 right-3 glass px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold">{product.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4 pt-1 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{product.category}</p>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm font-black text-gray-900	">
                        {Rupiah(product.price)}
                      </span>
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                        <ShoppingBag size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-20 bg-gray-50 rounded-[40px] mt-4">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No results found</h3>
              <p className="text-sm text-gray-500 px-10">We couldn't find what you're looking for. Try another search terms.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bonus Mobile Feature: Floating CTA if not logged in */}
      {!user && (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-slide-up">
          <div className="glass bg-blue-600/90 text-white p-4 rounded-3xl flex items-center justify-between shadow-2xl shadow-blue-600/20 border border-white/20">
            <div>
              <h4 className="font-bold">Join the community!</h4>
              <p className="text-[10px] text-blue-100">Get early access to premium tech deals.</p>
            </div>
            <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}


export default LandingPage