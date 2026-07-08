import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { CartItemLocal, Product } from '@/types/types'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/utils'
import { getEffectivePrice, normaliseProduct } from '@/lib/product'

interface CartContextType {
  items: CartItemLocal[]
  addItem: (product: Product, quantity: number, size: string | null) => void
  removeItem: (productId: string, size: string | null) => void
  updateQuantity: (productId: string, size: string | null, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  shippingCost: number
  grandTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemLocal[]>(() => {
    try {
      const saved = localStorage.getItem('rl_cart')
      if (!saved) return []
      const parsed = JSON.parse(saved) as CartItemLocal[]
      // Re-normalise products in case any were stored before the data-shape fix.
      return parsed.map(item => ({
        ...item,
        product: normaliseProduct(item.product),
      }))
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('rl_cart', JSON.stringify(items))
    } catch {
      // Storage quota exceeded or unavailable — continue without persisting
    }
  }, [items])

  const addItem = (product: Product, quantity: number, size: string | null) => {
    if (product.stock === 0) {
      toast.error('This item is out of stock')
      return
    }

    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product_id === product.id && item.size === size
      )
      const currentQty = existingIndex >= 0 ? prev[existingIndex].quantity : 0
      const newQty = currentQty + quantity

      if (newQty > product.stock) {
        toast.error(`Only ${product.stock} available`)
        return prev
      }

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty }
        return updated
      }

      return [...prev, { product_id: product.id, quantity, size, product }]
    })

    toast.success('Added to cart')
  }

  const removeItem = (productId: string, size: string | null) => {
    setItems(prev =>
      prev.filter(item => !(item.product_id === productId && item.size === size))
    )
  }

  const updateQuantity = (productId: string, size: string | null, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.product_id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + getEffectivePrice(item.product) * item.quantity, 0)
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal > 0 ? SHIPPING_COST : 0)
  const grandTotal = subtotal + shippingCost

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingCost,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
