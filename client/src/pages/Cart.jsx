import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Rupiah } from '../utils/Currency'

import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CreditCard
} from 'lucide-react'
import axios from 'axios'

const Cart = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchCart()
  }, [user, navigate])

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart')
      setCart(response.data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/items/${cartItemId}`, { quantity: newQuantity })
      fetchCart()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update quantity')
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`/api/cart/items/${cartItemId}`)
      fetchCart()
    } catch (error) {
      alert('Failed to remove item')
    }
  }

  const clearCart = async () => {
    if (!confirm('Clear your cart?')) return
    try {
      await axios.delete('/api/cart/clear')
      fetchCart()
    } catch (error) {
      alert('Failed to clear cart')
    }
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const response = await axios.post('/api/orders/create', {
        shippingAddress: 'Jakarta, Indonesia',
        paymentMethod: 'bank_transfer'
      })
      window.location.href = response.data.snapRedirectUrl
    } catch (error) {
      alert(error.response?.data?.error || 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const cartTotal = calculateTotal()
  const shippingCost = 10000
  const grandTotal = cartTotal + shippingCost

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <div className="p-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Bag</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{totalItems} items</p>
          </div>
          {cart?.items?.length > 0 && (
            <button onClick={clearCart} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full">
              Clear all
            </button>
          )}
        </div>

        {!cart?.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-[40px] p-12 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-blue-200" />
            </div>
            <h3 className="text-xl font-bold mb-2">Bag is empty</h3>
            <p className="text-sm text-gray-400 mb-8">Items you add to your bag will appear here.</p>
            <Link to="/products" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-blue-600/20">
              Browse Store
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 flex gap-4 animate-fade-in">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shadow-inner">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.product.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.product.category}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-blue-600">{Rupiah(item.product.price)}</span>
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      ><Minus size={14} /></button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold"
                      ><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="self-start text-gray-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Summary Bar */}
      {cart?.items?.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-slide-up">
          <div className="glass p-6 rounded-[32px] border border-white/20 shadow-2xl shadow-black/5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Price</p>
                <p className="text-2xl font-black text-gray-900">{Rupiah(grandTotal)}</p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm disabled:opacity-50"
              >
                {checkoutLoading ? '...' : 'Checkout'}
              </button>
            </div>
            <div className="flex gap-2 items-center text-[10px] font-bold text-gray-400">
              <Truck size={12} />
              <span>Includes {Rupiah(shippingCost)} delivery fee</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default Cart